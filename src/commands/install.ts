import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import {loadTaskDict} from '@listenai/lisa_core'
import lpminit from '../util/lpminit'

export default class Install extends Command {
  static description = '安装依赖'

  static args = [
    {
      name: 'pkg',
      required: false,
      description: "资源包名，例：'@source/csk4002'，不填时默认安装lisa项目中的依赖",
    },
  ]

  static strict = false

  async run() {
    const {application, cli, exec} = lisa
    const {argv} = this.parse(Install)
    const hasRegistry = argv.some(item => item.startsWith('--registry='))
    const globalInstall = argv.some(item => item === '-g' || item === '--global')
    const hasPkg = argv.some(item => !item.startsWith('-'))

    const command = (globalInstall ? ['install'] : hasPkg ? ['add'] : []).concat(argv)

    cli.action.start('安装依赖', '正在安装', {stdout: true})
    if (!hasRegistry) {
      command.push(`--registry=${application.registryUrl}`)
      await lpminit()
    }

    try {
      this.debug(globalInstall ? 'npm' : 'yarn', command.join(' '))
      const code = await exec(globalInstall ? 'npm' : 'yarn', command, undefined, line => {
        this.debug(line)
      })
      this.debug(code)
      if (code === 0) {
        await loadTaskDict()
      }
      cli.action.stop(code === 0 ? '成功' : '失败')
    } catch (error) {
      cli.action.stop('失败')
      this.error(error.message)
    }
  }
}
