import * as fs from 'fs'
import * as path from 'path'
import {IcmdWord, IdefaultBin, Interact, InteractConfig, Iresponse, Itone, ItonesConfig, Tones} from '../data'
import defaultPath from '../util/default-path'
import tomlHandler from '../util/toml-handler'
import util from '../util/util'
import download from '../util/download'
import request from '../util/request'
import cpExec from '../util/cp-exec'
import * as tmp from 'tmp'
import File from '../util/file'
import Utils from '../lib/utils'
const iconv = require('iconv-lite')

export default class PreBuildRes {
  log: any;

  error: any;

  pconfig: any;

  manifest: any;

  _defaultBin: IdefaultBin;

  private _tones: any

  _finishResolver: any

  private _asrRes: any

  private _finishCode: any

  constructor(self: any) {
    this.log = self.log
    this.error = self.error
    this._defaultBin = {}
  }

  async start() {
    // this.log('start!')
    this._finishCode = {
      tones: false,
      asr: false,
    }
    let finishResolver: { (arg0: number): void; (value: unknown): void } | null = null
    const cmdDonePromise = new Promise(r => {
      finishResolver = r
    })

    this._finishResolver = finishResolver

    await this._getPconf()
    await this._initManifest()
    await this._checkMasterBin()
    await this._checkScriptBin()
    await this._checkApplication()
    await this._checkHardware()
    await this._checkOtherBin()

    if (
      !this.manifest.biasBin ||
      !this.manifest.flashbootBin
    ) {
      // this.log('正在获取bias.bin、flashboot.bin')
      await this._initDefaultBin()
    }

    if (this.manifest.tones.total !== this.manifest.tones.finish) {
      // this.log('正在获取tones音频')
      this._initTones()
    }

    this._initAsr()

    // this.log(JSON.stringify(pconfig))
    await cmdDonePromise
    return this.pconfig
  }

  async _finish(type: string) {
    this._finishCode[type] = true
    if (Object.keys(this._finishCode).every(key => this._finishCode[key])) {
      this._finishResolver(true)
    }
    // 重新生成main_finaly/cmd_finaly.txt
    if (fs.existsSync(defaultPath.buildingPath('cmd.txt'))) {
      fs.copyFileSync(defaultPath.buildingPath('cmd.txt'), defaultPath.buildingPath('cmd_finaly.txt'))
    }
    if (fs.existsSync(defaultPath.buildingPath('main.txt'))) {
      fs.copyFileSync(defaultPath.buildingPath('main.txt'), defaultPath.buildingPath('main_finaly.txt'))
    }
  }

  async _getPconf() {
    let config = tomlHandler.load(defaultPath.cwd('project.csk'))
    const baseConfig = tomlHandler.load(defaultPath.configPath('base.csk'))
    const tonesConfig: ItonesConfig = (tomlHandler.load(defaultPath.configPath('tones.csk')) as unknown as ItonesConfig)

    let maxTtsId = tonesConfig.tts.length > 0 ?
      tonesConfig.tts.reduce((p: Tones, v: Tones) => (p.id < v.id ? v : p)).id :
      0

    let interactConfig: InteractConfig = {
      template: '',
      interact: [],
    }
    if (fs.existsSync(defaultPath.configPath('interact.csk'))) {
      interactConfig = (tomlHandler.load(defaultPath.configPath('interact.csk')) as unknown as InteractConfig)
    }
    const welcome: number[] = []
    const cmds: Interact[] = []
    const wakeup: Interact[] = []
    const entityTts: Tones[] = [];
    (interactConfig.interact || []).forEach(item => {
      switch (item.action) {
      case 'welcome':
        if (item.play && item.play !== 1001) {
          welcome.push(parseInt(String(item.play), 10))
        }
        break
      case 'cmd':
        if (item.text) {
          if (item.play && item.play === 1001) {
            maxTtsId += 1
            entityTts.push({
              id: maxTtsId,
              text: `将为您${item.text}`,
            })
            item.play = maxTtsId
          }
          cmds.push(item)
        }
        break
      case 'wakeup':
        if (item.text) {
          if (item.play && item.play === 1001) {
            maxTtsId += 1
            entityTts.push({
              id: maxTtsId,
              text: `将为您${item.text}`,
            })
            item.play = maxTtsId
          }
          wakeup.push(item)
        }
        break
      default:
        break
      }
    })
    config = Object.assign(config, {
      template: interactConfig.template,
      welcome,
      cmds,
      wakeup,
    })

    tonesConfig.tts = [...tonesConfig.tts, ...entityTts]

    config = Object.assign(config, baseConfig)
    config = Object.assign(config, {tones: tonesConfig})
    this.pconfig = config
  }

  async _initManifest() {
    const manifest = {
      name: this.pconfig.name,
      buildVersion: this.pconfig.build_version,
      buildVersionCode: this.pconfig.build_version_code,
      startTime: new Date().getTime(),
      tones: {
        total: this.pconfig.tones.tts.length + this.pconfig.tones.include.length,
      },
      asrResources: {
        taskId: '',
        state: '等待提交训练',
        wakeupBin: false,
        commandBin: false,
        mlpBin: false,
        mlpVsBin: false,
        wakeupTxt: false,
        commandTxt: false,
      },
      templateTxt: !this.pconfig.template,
      biasBin: false,
      masterBin: false,
      flashbootBin: false,
      scriptBin: false,
      hardwareJson: false,
      applicationJson: false,
      state: '开始打包...',
      stateCode: 1,
    }

    this.manifest = manifest
  }

  // 检查编译固件源码
  async _checkSource(sourceName: string, version: string) {
    const res = await cpExec.run(
      `npm ls ${sourceName}@${version}`,
      defaultPath.targetPath()
    )
    if (!res) {
      // this.error('当前项目没有可定制开发的基础固件')
      throw new Error('当前项目没有可定制开发的基础固件')
    }
  }

  // 检查编译的工具和修改编译脚本
  async _checkToolchain(CSK_DIR: string, CSK_DIR_APP: string) {
    const toolchainCmd = 'nds-toolchain'
    const installToolchainCmd = 'lisa install @tool/nds-toolchain -g'

    let CSK_TOOLCHAIN: any = await cpExec.get(toolchainCmd, defaultPath.cwd())

    if (!CSK_TOOLCHAIN) {
      // this.log('没有cywin')
      const installRes = await cpExec.run(
        installToolchainCmd,
        defaultPath.cwd()
      )
      if (installRes) {
        CSK_TOOLCHAIN = await cpExec.get(
          toolchainCmd,
          defaultPath.targetPath()
        )
        const tmpDir = tmp.dirSync()
        File.copyFolder(CSK_DIR_APP, tmpDir.name)
        await Utils.sleep(1000)
        let buildBat = fs
        .readFileSync(path.join(__dirname, '../../public/toolchain/build'))
        .toString()
        buildBat = buildBat.replace('#CSK_TOOLCHAIN#', CSK_TOOLCHAIN)
        buildBat = buildBat.replace('#CSK_APP_DIR#', tmpDir.name)
        buildBat = buildBat.replace('#CSK_DIR#', CSK_DIR)
        buildBat = buildBat.replace(
          '#BUILD#',
          'build'
        )
        buildBat = iconv.encode(buildBat, Utils.getPlatformEncoding())
        fs.writeFileSync(defaultPath.targetPath('build.bat'), buildBat)
      } else {
        // this.error('编译环境准备失败')
        throw new Error('编译环境准备失败')
      }
    } else  {
      const tmpDir = tmp.dirSync()
      File.copyFolder(CSK_DIR_APP, tmpDir.name)
      await Utils.sleep(1000)
      let buildBat = fs
      .readFileSync(path.join(__dirname, '../../public/toolchain/build'))
      .toString()
      buildBat = buildBat.replace('#CSK_TOOLCHAIN#', CSK_TOOLCHAIN)
      buildBat = buildBat.replace('#CSK_APP_DIR#', tmpDir.name)
      buildBat = buildBat.replace('#CSK_DIR#', CSK_DIR)
      buildBat = buildBat.replace(
        '#BUILD#',
        'build'
      )
      buildBat = iconv.encode(buildBat, Utils.getPlatformEncoding())
      fs.writeFileSync(defaultPath.targetPath('build.bat'), buildBat)
    }
  }

  async _checkMasterBin() {
    if (fs.existsSync(defaultPath.configPath('alias/master.bin'))) {
      this.manifest.masterBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.configPath('alias/master.bin'), defaultPath.buildingPath('master.bin'))
    } else if (fs.existsSync(defaultPath.targetPath('master.bin'))) {
      this.manifest.masterBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.targetPath('master.bin'), defaultPath.buildingPath('master.bin'))
    }

    if (!this.manifest.masterBin) {
      // this.error('请先编译基础固件')
      throw new Error('请先编译基础固件')
    }
  }

  async _checkScriptBin() {
    if (fs.existsSync(defaultPath.configPath('alias/script.bin'))) {
      this.manifest.scriptBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.configPath('alias/script.bin'), defaultPath.buildingPath('script.bin'))
    } else if (fs.existsSync(defaultPath.targetPath('script.bin'))) {
      this.manifest.scriptBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.targetPath('script.bin'), defaultPath.buildingPath('script.bin'))
    }

    if (!this.manifest.scriptBin) {
      // this.error('请先编译基础固件')
      throw new Error('请先编译基础固件')
    }
  }

  async _checkApplication() {
    if (fs.existsSync(defaultPath.configPath('environment/application.toml'))) {
      const applicationJson = tomlHandler.load(defaultPath.configPath('environment/application.toml'))
      fs.writeFileSync(defaultPath.buildingPath('application.json'), JSON.stringify(applicationJson, null, '\t'))
      this.manifest.applicationJson = true
    }

    if (!this.manifest.applicationJson) {
      // this.error('请先配置板型模板')
      throw new Error('请先配置板型模板')
    }
  }

  async _checkHardware() {
    if (fs.existsSync(defaultPath.configPath('environment/hardware.toml'))) {
      const hardwareJson = tomlHandler.load(defaultPath.configPath('environment/hardware.toml'))
      fs.writeFileSync(defaultPath.buildingPath('hardware.json'), JSON.stringify(hardwareJson, null, '\t'))
      this.manifest.hardwareJson = true
    }

    if (!this.manifest.hardwareJson) {
      // this.error('请先配置板型模板')
      throw new Error('请先配置板型模板')
    }
  }

  async _checkOtherBin() {
    if (fs.existsSync(defaultPath.configPath('alias/bias.bin'))) {
      this.manifest.biasBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.configPath('alias/bias.bin'), defaultPath.buildingPath('bias.bin'))
    }
    if (fs.existsSync(defaultPath.configPath('alias/flashboot.bin'))) {
      this.manifest.flashbootBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.configPath('alias/flashboot.bin'), defaultPath.buildingPath('flashboot.bin'))
    }
    if (fs.existsSync(defaultPath.configPath('alias/mlp.bin'))) {
      this.manifest.mlpBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.configPath('alias/mlp.bin'), defaultPath.buildingPath('mlp.bin'))
    }
    if (fs.existsSync(defaultPath.configPath('alias/main.bin'))) {
      this.manifest.wakeupBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.configPath('alias/main.bin'), defaultPath.buildingPath('main.bin'))
    }
    if (fs.existsSync(defaultPath.configPath('alias/cmd.bin'))) {
      this.manifest.commandBin = true
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(defaultPath.configPath('alias/cmd.bin'), defaultPath.buildingPath('cmd.bin'))
    }
    if (this.pconfig.chip.name === '4002') {
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      fs.copyFileSync(path.join(__dirname, '../../public/1KHz.mp3'), defaultPath.buildingPath('1KHz.mp3'))
    }

    if (this.manifest.asrResources.wakeupBin && this.manifest.asrResources.commandBin && this.manifest.asrResources.mlpBin) {
      this.manifest.asrResources = {
        taskId: 'unnecc',
        state: '无需训练',
        wakeupBin: true,
        commandBin: true,
        mlpBin: true,
        mlpVsBin: true,
        wakeupTxt: true,
        commandTxt: true,
      }
    }
  }

  async _initDefaultBin() {
    this._defaultBin = {
      handlingBiasBin: this.manifest.biasBin || false,
      handlingFlashbootUrl: this.manifest.flashbootBin || false,
      urls: [],
    }
    await this._req('defaultBin')
  }

  async _initTones() {
    this._tones = []

    const tonesTts = this.pconfig.tones.tts || []
    const tonesInclude = this.pconfig.tones.include || []

    tonesInclude.forEach((include: Itone) => {
      if (!include.text) {
        fs.writeFileSync(defaultPath.buildingPath(`tones/${include.id}.mp3`), '')
      } else {
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        fs.copyFileSync(defaultPath.cwd(`deps/tones_include/${include.text}`), defaultPath.buildingPath(`tones/${include.id}.mp3`))
      }
    })

    tonesTts.forEach((tts: Itone) => {
      if (!tts.text) {
        fs.writeFileSync(defaultPath.buildingPath(`tones/${tts.id}.mp3`), '')
      } else {
        const ttsFileName = `${tts.text}-${this.pconfig.speaker.vcn}-${this.pconfig.speaker.volume}-${this.pconfig.speaker.speed}.mp3`
        if (fs.existsSync(defaultPath.tonesCachePath(ttsFileName))) {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          fs.copyFileSync(defaultPath.tonesCachePath(ttsFileName), defaultPath.buildingTonesPath(`${tts.id}.mp3`))
          // this.log(`tts:${tts.text} 完成`)
        } else {
          tts.cacheName = ttsFileName
          this._tones.push(tts)
        }
      }
    })

    this._handleTones()
  }

  async _initAsr() {
    // this.log('正在获取asr资源')
    this._asrRes = {
      taskId: '',
      urls: [],
    }
    // 新增判断，是否需要冲击训练
    const mainWords = this.pconfig.wakeup
    const cmdWords: IcmdWord[] = this.pconfig.cmds.map((cmd: IcmdWord, index: number) => {
      return {
        id: index + 1,
        text: cmd.text,
        pinyin: cmd.pinyin,
        play: cmd.play,
        cmds: cmd.cmds,
      }
    })

    const wordsThresholdJson: any = {}
    if (fs.existsSync(defaultPath.configPath('thresholds/main_finaly.txt'))) {
      const wordsThresholdStr = fs.readFileSync(defaultPath.configPath('thresholds/main_finaly.txt')).toString()
      const wordsThreshold = wordsThresholdStr.split('\r').join('').split('\n').filter(val => val !== '')
      wordsThreshold.forEach(threshold => {
        const thresholdArr = threshold.split(',')
        if (parseInt(String(thresholdArr[0] || 0), 10)) {
          wordsThresholdJson[thresholdArr[4]] = threshold
        }
      })
    }

    const cmdsThresholdJson: any = {}
    if (fs.existsSync(defaultPath.configPath('thresholds/cmd_finaly.txt'))) {
      const cmdsThresholdStr = fs.readFileSync(defaultPath.configPath('thresholds/cmd_finaly.txt')).toString()
      const cmdsThreshold = cmdsThresholdStr.split('\r').join('').split('\n').filter(val => val !== '')
      cmdsThreshold.forEach(threshold => {
        const thresholdArr = threshold.split(',')
        if (thresholdArr[0]) {
          cmdsThresholdJson[thresholdArr[4]] = threshold
        }
      })
    }
    let allHas = true

    const mainTxtArr = []
    if (allHas) {
      for (let i = 0; i <= mainWords.length - 1; i++) {
        const wakeup = mainWords[i]
        if (wordsThresholdJson[wakeup.pinyin]) {
          mainTxtArr.push(wordsThresholdJson[wakeup.pinyin])
        } else {
          allHas = false
          break
        }
      }
    }

    const cmdTxtArr = []
    if (allHas) {
      for (let i = 0; i <= cmdWords.length - 1; i++) {
        const cmd = cmdWords[i]
        if (cmdsThresholdJson[cmd.pinyin]) {
          cmdTxtArr.push(cmdsThresholdJson[cmd.pinyin])
        } else {
          allHas = false
          break
        }
      }
    }

    if (allHas) {
      const mainTxt = mainTxtArr.join('\n')
      const cmdTxt = cmdTxtArr.join('\n')

      fs.writeFileSync(defaultPath.buildingPath('main.txt'), mainTxt)
      fs.writeFileSync(defaultPath.buildingPath('cmd.txt'), `${mainTxt}\n${cmdTxt}`)

      this.manifest.asrResources.wakeupTxt = true
      this.manifest.asrResources.commandTxt = true
      this.manifest.asrResources.wakeupBin = true
      this.manifest.asrResources.commandBin = true
      this.manifest.asrResources.state = '正在下载资源'
      tomlHandler.save(defaultPath.buildingPath('manifest.toml'), this.manifest)

      this._asrRes = {
        urls: [
          {
            name: 'mlp.bin',
            uri: 'https://cdn.iflyos.cn/public/lstudio/mlpDir/mlp.bin',
            param: 'mlpBin',
          },
          {
            name: 'mlp_vs.bin',
            uri: 'https://cdn.iflyos.cn/public/lstudio/mlpDir/mlp_vs.bin',
            param: 'mlpVsBin',
          },
        ],
      }

      this._handleAsr()
    } else {
      // const errPinyin = Common.checkPinyin(AsrRes.pconfig)
      // if (errPinyin.length) {
      //   return vscode.window.showErrorMessage(
      //     `请检查以下拼音是否都包含音调，或音调是否在（1-5）范围中 [${errPinyin.join(',')}]`
      //   )
      // }
      await this._req('asr', {
        mainWords,
        cmdWords,
      })
      // this._asrRes = {
      //   taskId: '34ff6d9d53f8e922b1871cd0bc447de9',
      // }
      // await this._req('asrCheck')
      // AsrRes.req()
    }
  }

  async _handleTones() {
    if (this._tones.length > 0) {
      await this._req('tones')
    } else {
      this._finish('tones')
    }
  }

  async _req(type: string, data?: any) {
    const self = this
    let opt = {
      method: '',
      url: '',
      body: {},
    }
    if (type === 'defaultBin') {
      opt = {
        method: 'POST',
        url: '/algLibraryUrl',
        body: {
          firmwareId: this.pconfig.firmware.id,
          hardwareId: this.pconfig.hardware.id,
          sceneId: this.pconfig.scene.id,
          mainVersion: `${this.pconfig.firmware.version}-${this.pconfig.hardware.name}`,
          scene: this.pconfig.scene.name,
          micSpan: this.pconfig.asr_model.mic_space,
          micType: this.pconfig.asr_model.mic_type,
          modelId: this.pconfig.template,
        },
      }
    }
    if (type === 'tones') {
      opt = {
        method: 'POST',
        url: '/soundTrial',
        body: {
          speakerId: this.pconfig.speaker.vcn,
          speed: this.pconfig.speaker.speed,
          volume: this.pconfig.speaker.volume,
          message: util.trimSpace(this._tones[0].text),
        },
      }
    }
    if (type === 'asr') {
      opt = {
        method: 'POST',
        url: '/runPackage',
        body: {
          chipId: this.pconfig.chip.id,
          firmwareId: this.pconfig.firmware.id,
          hardwareId: this.pconfig.hardware.id,
          scene: this.pconfig.scene.name,
          micSpan: this.pconfig.asr_model.mic_space,
          micType: this.pconfig.asr_model.mic_type,
          highThresh: 50,
          lowThresh: 25,
          modelId: this.pconfig.template || '',
          wakeWordList: Array.prototype.map
          .call(
            data.mainWords,
            word => `${word.text}:${word.pinyin.replace(/\s/g, '_')}`
          )
          .join(';'),
          asrWordList: Array.prototype.map
          .call(
            data.cmdWords,
            word => `${word.text}:${word.pinyin.replace(/\s/g, '_')}`
          )
          .join(';'),
        },
      }
    }
    if (type === 'asrCheck') {
      opt = {
        method: 'POST',
        url: '/checkPackage',
        body: {
          taskid: this._asrRes.taskId,
        },
      }
    }
    const res: Iresponse = await request(opt)
    if (!res.err) {
      if (type === 'defaultBin') {
        this._defaultBin.urls = res.data
        await this._download(type)
      }
      if (type === 'tones') {
        await this._saveTone(res.data.url, this._tones[0])
      }
      if (type === 'asr') {
        this._asrRes.taskId = res.data.taskid
        await this._handleAsr()
      }
      if (type === 'asrCheck') {
        if (this._asrRes.checkTimes) {
          this.log('[####################] 100%')
          this.log('云端冲击训练完成！')
        }
        this._asrRes = {
          urls: [
            {
              name: 'main.bin',
              uri: res.data.mainResPath,
              param: 'wakeupBin',
            },
            {
              name: 'cmd.bin',
              uri: res.data.asrResPath,
              param: 'commandBin',
            },
            {
              name: 'mlp.bin',
              uri: res.data.mlpResPath,
              param: 'mlpBin',
            },
            {
              name: 'mlp_vs.bin',
              uri: res.data.mlpVsResPath,
              param: 'mlpVsBin',
            },
            {
              name: 'main.txt',
              uri: res.data.mainStatePath,
              param: 'wakeupTxt',
            },
            {
              name: 'cmd.txt',
              uri: res.data.asrStatePath,
              param: 'commandTxt',
            },
          ],
        }

        this._handleAsr()
      }
    }
    if (res.err) {
      if (type === 'asrCheck') {
        if (res.err === '200004') {
          this.log(res.data.message)
        }
        if (res.err === '200001') {
          if (this._asrRes.checkTimes) {
            // eslint-disable-next-line max-depth
            if (this._asrRes.checkTimes > 90) {
              this._asrRes.checkTimes += 0.1
            } else {
              this._asrRes.checkTimes += 2
            }
          } else {
            this._asrRes.checkTimes = 1
            this.log(res.data.message)
          }
          let prossBar = ''
          for (let i = 0; i < this._asrRes.checkTimes; i += 5) {
            prossBar += '#'
          }
          this.log(`[${prossBar}] ${this._asrRes.checkTimes}%`)
        }
        setTimeout(async function () {
          await self._req('asrCheck')
        }, 10000)
      }
    }
  }

  async _download(type: string) {
    if (type === 'defaultBin') {
      await this._save(this._defaultBin.urls.biasUrl, 'bias.bin', 'biasBin')
      await this._save(this._defaultBin.urls.flashbootUrl, 'flashboot.bin', 'flashbootBin')
    }
  }

  async _save(uri: string, fileName: string, paramName: string) {
    // this.log(`正在下载${fileName}...`)
    const downRes = await download(uri, defaultPath.buildingPath(fileName))
    if (downRes) {
      this.manifest[paramName] = true
    }
  }

  async _saveTone(uri: string, tts: Itone) {
    const self = this
    // this.log(`正在下载tts:${tts.text}...`)
    const downRes = await download(uri, defaultPath.tonesCachePath(tts.cacheName))
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    fs.copyFileSync(defaultPath.tonesCachePath(tts.cacheName), defaultPath.buildingPath(`tones/${tts.id}.mp3`))
    if (downRes) {
      this._tones.splice(0, 1)
      this._handleTones()
    } else {
      this.log(`下载${tts.text}失败...开始重试...`)
      setTimeout(function () {
        self._saveTone(uri, tts)
      }, 5000)
    }
  }

  async _handleAsr() {
    if (this._asrRes.taskId) {
      this._req('asrCheck')
      return
    }
    if (this._asrRes.urls.length > 0) {
      await this._saveAsr()
    } else {
      this._finish('asr')
    }
  }

  async _saveAsr() {
    const self = this
    const res = this._asrRes.urls[0]
    // this.log(`正在下载资源:${res.name}...`)
    const downRes = await download(res.uri, defaultPath.buildingPath(res.name))
    if (downRes) {
      this.manifest.asrResources[res.param] = true
      this._asrRes.urls.splice(0, 1)
      this._handleAsr()
    } else {
      this.log(`下载${res.name}失败...开始重试...`)
      setTimeout(function () {
        self._saveAsr()
      }, 5000)
    }
  }
}

