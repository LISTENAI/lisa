import {Command, flags} from '@oclif/command'
import * as path from 'path'
import lisa from '@listenai/lisa_core'
import FlashCommand from '../lib/flash-command'
import * as AdmZip from 'adm-zip'
export default class Flash extends Command {
  static description = '烧录程序'

  static args = [
    {
      name: 'filePath',
      require: false,
      description: '烧录的lpk包绝对路径，非必填，默认烧录csk开发项目package后的lpk包',
    },
  ]

  static flags = {
    part: flags.string({
      char: 'p',
      description: "选择烧录part文件，例：'-p master -p script'，默认全部烧录",
    }),
  }

  async run() {
    const {args} = this.parse(Flash)
    const {application, fs} = lisa
    let fp = ''
    if (args.filePath) {
      fp = `${args.filePath}`
    }
    const lpkPath = application.context.cskBuild?.debugLpkPath || ''
    if (!fp) {
      const defaultLpkFile = path.join(lpkPath, 'burner.lpk')
      if (!fs.existsSync(defaultLpkFile)) {
        this.error('请先打包出lpk包或以参数传入')
      }
      fp = defaultLpkFile
    }
    const {raw} = this.parse(Flash)
    const parts = raw.filter(item => item.type === 'flag' && item.flag === 'part').map(item => item.input).join(' ')

    // 获取LPK目录绝对路径
    const parsed = path.parse(fp)
    // 获取LPK根目录路径
    const lkpDirPath = parsed.dir

    application.addContext('cskburn', {
      fp: fp,
      lkpDirPath: lkpDirPath,
      parts: parts,
    })

    // 判断是否zip格式
    if (fp.indexOf('.zip') !== -1) {
      let allBin: Array<string> = ['flashboot.bin', 'master.bin', 'respak.bin']
      const zip = new AdmZip(fp)
      const zipEntries = zip.getEntries()
      zipEntries.forEach(function (zipEntry) {
        if (!zipEntry.isDirectory) {
          const name = zipEntry.entryName
          allBin = allBin.filter(item => item !== name)
        }
      })
      if (allBin.length > 0) {
        return this.log(`压缩包中缺少 [${allBin.join(',')}] 文件`)
      }

      await this.unzip(fp)
      const {params, binList} = await this.parseZip(lkpDirPath)
      await this.startFlash(params, binList)
    } else {
      await this.unzip(fp)
      const {params, binList} = await this.parseJson(lkpDirPath, parts)
      await this.startFlash(params, binList)
    }
  }

  async unzip(fp) {
    const {fs} = lisa
    await fs.project.unzip(fp, path.dirname(fp))
  }

  async parseZip(dir) {
    const {fs} = lisa
    // 判断固件是否存在
    const imgExist = fs.existsSync(path.join(dir, 'burner.img'))
    this.debug(`固件地址：${path.join(dir, 'burner.img')}`)
    if (imgExist) {
      const flashbootExist = fs.existsSync(path.join(dir, 'flashboot.bin'))
      const masterExist = fs.existsSync(path.join(dir, 'master.bin'))
      const scriptExist = fs.existsSync(path.join(dir, 'script.bin'))
      const respeakExist = fs.existsSync(path.join(dir, 'respak.bin'))

      const params: Array<string> = []
      // bin描述信息
      const binList: Array<string> = []

      if (flashbootExist) {
        const addr = '0'
        const filePath: string = path.join(dir, 'flashboot.bin')
        params.push(addr)
        params.push(filePath)
        binList.push(`flashboot(${addr})`)
      }

      if (masterExist) {
        const addr = '0x10000'
        const filePath: string = path.join(dir, 'master.bin')
        params.push(addr)
        params.push(filePath)
        binList.push(`manifest(${addr})`)
      }

      if (scriptExist) {
        const addr = '0xf0000'
        const filePath: string = path.join(dir, 'script.bin')
        params.push(addr)
        params.push(filePath)
        binList.push(`script(${addr})`)
      }

      if (respeakExist) {
        const addr = '0x100000'
        const filePath: string = path.join(dir, 'respak.bin')
        params.push(addr)
        params.push(filePath)
        binList.push(`respak(${addr})`)
      }

      this.debug(params)
      return {
        params,
        binList,
      }
    }
    throw new Error('读取manifest.json文件失败')
  }

  async parseJson(dir, parts) {
    const {fs} = lisa
    // 判断固件是否存在
    const jsonPath: string = path.join(dir, 'manifest.json')
    const manifestExist = fs.existsSync(jsonPath)
    if (manifestExist) {
      const params: Array<string> = []
      // bin描述信息
      const binList: Array<string> = []
      const jsonData = fs.readFileSync(jsonPath, 'utf-8')
      const json = JSON.parse(jsonData)
      // let burner: string = json.burner
      // burner = path.join(dir, burner)
      const images = json.images
      // params.push('-w')
      // params.push(burner)
      const partList = parts.split(' ', 4)
      // eslint-disable-next-line guard-for-in
      if (partList.length === 0 || parts === 'undefined' || parts === '') {
        // eslint-disable-next-line guard-for-in
        for (const key in images) {
          const value = images[key]
          const addr = value.addr
          const file: string = value.file
          const filePath: string = file.replace('.', dir)
          // eslint-disable-next-line no-console
          params.push(addr)
          params.push(filePath)

          binList.push(`${key}(${addr})`)
        }
      } else {
        // eslint-disable-next-line guard-for-in
        for (const key in images) {
          const value = images[key]
          const addr = value.addr
          const file: string = value.file
          const filePath: string = file.replace('.', dir)
          for (const p in partList) {
            // eslint-disable-next-line max-depth
            if (partList[p] === key) {
              // eslint-disable-next-line no-console
              params.push(addr)
              params.push(filePath)

              binList.push(`${key}(${addr})`)
            }
          }
        }
      }
      return {
        params,
        binList,
      }
    }
    throw new Error('读取manifest.json文件失败')
  }

  async startFlash(params, binList) {
    const flashCommand: FlashCommand = new FlashCommand()
    flashCommand.excuteCommand(params, binList)
  }
}
