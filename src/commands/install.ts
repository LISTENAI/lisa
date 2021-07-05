import {Command, flags} from '@oclif/command'
// import defaultPath from '../util/default-path'
// import tomlHandler from '../util/toml-handler'
import lmp from '../util/lmp'
// import * as fs from 'fs'
// import * as logSymbols from 'log-symbols'
import Utils from '../lib/utils'
import cli from 'cli-ux'

export default class Install extends Command {
  static description = '安装依赖'

  static args = [
    {
      name: 'pkg',
      required: false,
      description: "资源包名，例：'@source/csk4002'，不填时默认安装lisa项目中的依赖",
    },
  ]

  static flags = {
    global: flags.boolean({
      char: 'g',
      description: '全局安装依赖',
    }),
  }

  static strict = false

  async run() {
    const {flags, argv} = this.parse(Install)

    cli.action.start('安装依赖', '正在安装', {stdout: true})

    if (argv.length > 0) {
      const pkgName = argv.map(pkg => {
        // if (pkg.split('@')[2]) {
        //   pkg = `@${pkg.split('@')[1]}@'${pkg.split('@')[2]}'`
        // }
        return pkg
      })
      const installRes = await lmp.install(pkgName, flags.global)
      if (installRes) {
        cli.action.stop('成功')
      } else {
        cli.action.stop('失败')
        this.log(`error-log存放在：${Utils.getGlobal('application').logPath}/exec-error.log`)
      }
    }

    if (argv.length <= 0) {
      const installRes = await lmp.install([], flags.global)
      if (installRes) {
        cli.action.stop('成功')
      } else {
        cli.action.stop('失败')
        this.log(`error-log存放在：${Utils.getGlobal('application').logPath}/exec-error.log`)
      }
    }
  }
}
