import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'
import {runner} from '@listenai/lisa_core'
import Utils from '../lib/utils'
import FlashCommand from '../lib/flash-command'
import AdmZip = require('adm-zip')
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
    let fp = ''
    if (args.filePath) {
      fp = `${args.filePath}`
    }
    const lpkPath = Utils.getGlobal('application').context.cskBuild?.debugLpkPath || ''
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

    Utils.getGlobal('application').addContext('cskburn', {
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

      runner(['flash:compress', 'flash:parse_zip'].join(',')).then((ctx: any) => {
        const {cskburn} = ctx.application.context
        const flashCommand: FlashCommand = new FlashCommand()
        flashCommand.excuteCommand(cskburn.lkpDirPath, ctx.params, ctx.binList)
      }).catch((error: any) => {
        this.error(error)
      })
    } else {
      runner(['flash:compress', 'flash:parse_json'].join(',')).then((ctx: any) => {
        const {cskburn} = ctx.application.context
        const flashCommand: FlashCommand = new FlashCommand()
        flashCommand.excuteCommand(cskburn.lkpDirPath, ctx.params, ctx.binList)
      }).catch((error: any) => {
        this.error(error)
      })
    }
  }
}
