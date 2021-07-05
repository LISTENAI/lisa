const fs = require('fs')
const crc = require('crc')
import Utils from '../lib/utils'
import Common from './common'
import DefaultPath from './default-path'
import tomlHandler from './toml-handler'

const Respak: any = {
  basePackPath: DefaultPath.cwd(),
  resItemCount: 10 + 250 + 250,
  DefaultPath: DefaultPath,
  pconfig: null,

  async startPack(userId: any, pconfig: any) {
    this.pconfig = pconfig

    if (this.pconfig.pack_demo === 'custom') {
      const demoRes = this.allResources('demo')
      this.packageFw(demoRes, userId, '-demo')
    } else {
      const defaultRes = this.allResources('public')
      this.packageFw(defaultRes, userId, '-public')
    }

    return {event: 'success'}
  },

  allResources(sys_mode: string) {
    const resources = []
    resources.push(['INFO', Buffer.from('Castor ' + this.pconfig.build_version)])
    resources.push(['BIAS', fs.readFileSync(DefaultPath.buildingPath('bias.bin'))])
    resources.push(['MLPR', fs.readFileSync(DefaultPath.buildingPath('mlp.bin'))])
    resources.push(['KEY1', fs.readFileSync(DefaultPath.buildingPath('main.bin'))])
    resources.push(['KEY2', fs.readFileSync(DefaultPath.buildingPath('cmd.bin'))])

    resources.push(['KMAP', Buffer.from(this.newKeywords(sys_mode))])
    if (fs.existsSync(DefaultPath.buildingPath('1KHz.mp3'))) {
      resources.push(['TEST', fs.readFileSync(DefaultPath.buildingPath('1KHz.mp3'))])
    } else {
      resources.push(['TEST', Buffer.from('TEST')])
    }
    resources.push(['R007', Buffer.from('R007')])
    resources.push(['R008', Buffer.from(this.getHardwareJson())])
    resources.push(['R009', Buffer.from(this.getPrivateJson(sys_mode))])

    for (let index = 0; index < 250; index++) {
      if (index < this.pconfig.tones.tts.length) {
        const tone = this.pconfig.tones.tts[index]
        resources.push(['G' + this.fillItemID(tone.id), fs.readFileSync(DefaultPath.buildingPath('tones/' + tone.id + '.mp3'))])
      } else {
        resources.push(['G' + this.fillItemID(index + 1), Buffer.from('G' + (index + 1))])
      }
    }
    for (let index = 0; index < 250; index++) {
      if (index < this.pconfig.tones.include.length) {
        const tone = this.pconfig.tones.include[index]
        resources.push(['I' + this.fillItemID(tone.id - 250), fs.readFileSync(DefaultPath.buildingPath('tones/' + tone.id + '.mp3'))])
      } else {
        resources.push(['I' + this.fillItemID(index + 1), Buffer.from('I' + (index + 1))])
      }
    }
    let result = {headers: [], resData: Buffer.from(''), offset: (resources.length * 16) + (2 * 16)}
    resources.forEach(res => {
      result = this.resConcat(result.headers, result.resData, result.offset, res[0], res[1])
    })
    return result
  },

  newKeywords(sys_mode: string) {
    const fileName = 'keywords.txt'
    if (fs.existsSync(DefaultPath.buildingPath(fileName))) {
      return fs.readFileSync(DefaultPath.buildingPath(fileName)).toString()
    }

    let keywords: any = []
    const ctrlMode = this.pconfig.cmds_config.ctrl_mode === 'pwm' ? 2 : 1
    const cmdsTypeHex = this.pconfig.cmds_config.type === 'hex'

    const words = [...Common.totalCmd(this.pconfig), ...Common.totalAwake(this.pconfig)]
    const reg = /.{2}/g
    words.forEach(word => {
      const item = {
        key: word.pinyin,
        kid: word.id,
        txt: word.text,
        play: (sys_mode === 'demo' && word.play) ? [word.play] : [],
        cmds: [],
        infrared_cmds: [],
      }
      if (sys_mode === 'demo' && Boolean(word.cmds)) {
        if (ctrlMode === 2) {
          item.infrared_cmds = word.cmds.replace(/\s/g, '')
          .replace(/，/g, ',')
          .split(',')
          .filter((item: any) => item !== '')
          .map((item: any) => parseInt(item, 10))
        } else {
          item.cmds = cmdsTypeHex ?
            word.cmds.replace(/\s/g, '').match(reg) && word.cmds.replace(/\s/g, '').match(reg).map((item: any) => parseInt(item, 16)) :
            word.cmds.split('') && word.cmds.split('').map((item: any) => item.charCodeAt())
        }
      }
      keywords.push(JSON.stringify(item))
    })

    keywords = keywords.join('\n')

    fs.writeFileSync(DefaultPath.buildingPath('串口固件readme.md'), '')
    fs.writeFileSync(DefaultPath.buildingPath('开发固件readme.md'), '')

    fs.writeFileSync(DefaultPath.buildingPath(fileName), keywords)
    return keywords
  },

  getHardwareJson() {
    if (fs.existsSync(this.DefaultPath.environmentPath('hardware.json'))) {
      fs.copyFileSync(this.DefaultPath.environmentPath('hardware.json'), DefaultPath.buildingPath('hardware.json'))
      return fs.readFileSync(this.DefaultPath.environmentPath('hardware.json')).toString()
    }
    if (fs.existsSync(this.DefaultPath.environmentPath('hardware.toml'))) {
      const hardwareJson = tomlHandler.load(this.DefaultPath.environmentPath('hardware.toml'))
      fs.writeFileSync(
        DefaultPath.buildingPath('hardware.json'),
        JSON.stringify(hardwareJson),
        null, '\t'
      )
      return JSON.stringify(hardwareJson)
    }
    if (fs.existsSync(DefaultPath.buildingPath('hardware.json'))) {
      return fs.readFileSync(DefaultPath.buildingPath('hardware.json')).toString()
    }
    const conf = Utils.requireNoCache(DefaultPath.buildingPath('conf.json'))
    const hardwareJson = conf.hardware
    fs.writeFileSync(DefaultPath.buildingPath('hardware.json'), JSON.stringify(hardwareJson, null, '\t'))
    return JSON.stringify(hardwareJson)
  },

  getPrivateJson(sys_mode: string) {
    const fileName = 'application.json'
    let privateJson: any = ''
    if (fs.existsSync(this.DefaultPath.environmentPath(fileName))) {
      privateJson = Utils.requireNoCache(this.DefaultPath.environmentPath(fileName))
    }
    if (!privateJson) {
      if (fs.existsSync(this.DefaultPath.environmentPath('application.toml'))) {
        privateJson = tomlHandler.load(this.DefaultPath.environmentPath('application.toml'))
      }
    }
    if (!privateJson) {
      const conf = Utils.requireNoCache(DefaultPath.buildingPath('conf.json'))
      privateJson = conf.private
    }
    const ctrlMode = this.pconfig.cmds_config.ctrl_mode === 'pwm' ? 2 : 1
    const enterAsr: any = []
    Common.totalAwake(this.pconfig).forEach((word: any) => {
      enterAsr.push(word.id)
    })
    privateJson.business = Object.assign(privateJson.business, {
      sys_mode: sys_mode === 'demo' ? 'private' : sys_mode,
      welcome: sys_mode === 'demo' ? this.pconfig.welcome : [],
      play_vol: this.pconfig.speaker.volume,
      asr: {
        enter_asr: enterAsr,
        exit_asr: [],
        asr_mode: parseInt(this.pconfig.esr_config.app_mode, 10) === 4 ? 3 : parseInt(this.pconfig.esr_config.app_mode, 10) || 3,
        timeout: parseInt(this.pconfig.esr_config.app_mode, 10) === 3 ? parseInt(this.pconfig.esr_config.esr_timeout, 10) || 20 : 0,
        loop_mode: true,
        cmd_send_mode: ctrlMode,
      },
    })
    privateJson.hw_config = Object.assign(privateJson.hw_config, {
      mic: {
        type: this.pconfig.asr_model.mic_type.indexOf('模拟') >= 0 ? 'amic' : 'dmic',
        dist: parseInt(this.pconfig.asr_model.mic_space, 10),
      },
    })
    privateJson.driver.uart_ctrl.baudrate = parseInt(this.pconfig.cmds_config.baudrate, 10) // 波特率
    privateJson.driver.infrared.freq = this.pconfig.cmds_config.freq ? parseInt(this.pconfig.cmds_config.freq, 10) : 38000
    fs.writeFileSync(DefaultPath.buildingPath(fileName), JSON.stringify(privateJson, null, '\t'))
    return JSON.stringify(privateJson)
  },

  fillItemID(id: number) {
    if (id < 10) {
      return '00' + id
    }
    if (id < 100) {
      return '0' + id
    }
    return String(id)
  },

  int2HexStrFill(value: any) {
    const buf = Buffer.alloc(4)
    buf.writeUInt32LE(value, 0)
    return buf.toString('hex')
  },

  str2HexStrFill(value: any) {
    value = Buffer.from(value).toString('hex')
    let result = ''
    if (value.length % 2 !== 0) {
      value = '0' + value
    }
    for (let i = 0; i < 8 - value.length; i++) {
      result += '0'
    }
    return value + result
  },

  int2BitStrFill(num: any, length: any) {
    const str = num.toString(2)
    let result = ''
    if (length && length > str.length) {
      for (let index = 0; index < length - str.length; index++) {
        result += '0'
      }
    }
    return result + str
  },

  resConcat(headers: any, resData: any, offset: any, name: any, data: any) {
    headers.push(this.str2HexStrFill(name))
    headers.push(this.int2HexStrFill(resData.length + offset))
    headers.push(this.int2HexStrFill(data.length))
    headers.push(this.int2HexStrFill(crc.crc32(data)))
    // headers.push()
    // 每个数据内容，对齐4字节
    const fillData = Buffer.alloc(4 - (data.length % 4))
    return {headers: headers, resData: Buffer.concat([resData, data, fillData]), offset: offset}
  },

  resDateTime() {
    const now = new Date()
    const yy = this.int2BitStrFill(now.getFullYear() - 2000, 6)
    const mm = this.int2BitStrFill(now.getMonth() + 1, 4)
    const dd = this.int2BitStrFill(now.getDate(), 5)
    const hh = this.int2BitStrFill(now.getHours(), 5)
    const min = this.int2BitStrFill(now.getMinutes(), 6)
    const ss = this.int2BitStrFill(now.getSeconds(), 6)
    return Buffer.from(parseInt(yy + mm + dd + hh + min + ss, 2).toString(16), 'hex').readInt32BE(0, false)
  },

  packageFw(res: any, userId: any) {
    const res_tag = this.str2HexStrFill('IFLY')
    let hdr_crc = null
    const protocol_ver = this.int2HexStrFill(parseInt('10000', 16))
    const date_time = this.int2HexStrFill(this.resDateTime())
    const item_cnt = this.int2HexStrFill(this.resItemCount)
    const item_offset = this.int2HexStrFill(2 * 16)
    const data_len = this.int2HexStrFill(res.resData.length)
    const user_id = this.int2HexStrFill(userId)
    let headers = null

    headers = [protocol_ver, date_time, item_cnt, item_offset, data_len, user_id].concat(res.headers)
    hdr_crc = this.int2HexStrFill(crc.crc32(Buffer.from(headers.join(''), 'hex')))
    headers = Buffer.from([res_tag, hdr_crc].concat(headers).join(''), 'hex')

    fs.writeFileSync(DefaultPath.buildingPath('respak.bin'), Buffer.concat([headers, res.resData]))
  },

}

export default  Respak
