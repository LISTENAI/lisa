import {Command, flags} from '@oclif/command'
import Utils from '../lib/utils'
import lmp from '../util/lmp'
import cli from 'cli-ux'

export default class Uninstall extends Command {
  static description = '移除依赖'

  static args = [
    {
      name: 'pkg',
      required: false,
      description: "资源包名，例：'@tool/nds-toolchain @tool/cskburn'",
    },
  ]

  static flags = {
    global: flags.boolean({
      char: 'g',
      description: '全局移除依赖',
    }),
  }

  static strict = false

  async run() {
    const {argv, flags} = this.parse(Uninstall)
    if (argv.length <= 0) {
      this.error("缺少pkg参数，执行 'lisa uninstall --help' 查看帮助")
    }
    // this.log('start 移除依赖')
    const pkgName = argv.map(pkg => {
      // if (pkg.split('@')[2]) {
      //   pkg = `@${pkg.split('@')[1]}@'${pkg.split('@')[2]}'`
      // }
      return pkg
    })
    cli.action.start('移除依赖')
    try {
      const uninstallRes = await lmp.uninstall(pkgName, flags.global)
      if (uninstallRes) {
        cli.action.stop('完成')
      } else {
        cli.action.stop('失败')
        this.log(`error-log存放在：${Utils.getGlobal('application').logPath}/exec-error.log`)
      }
    } catch (error) {
      this.error(error)
    }
  }
}
