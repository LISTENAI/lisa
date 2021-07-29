import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'

export default class Uninstall extends Command {
  static description = '移除依赖'

  static args = [
    {
      name: 'pkg',
      required: false,
      description: "资源包名，例：'@alge/general'",
    },
  ]

  static strict = false

  async run() {
    const {cli, exec} = lisa
    const {argv} = this.parse(Uninstall)
    const globalInstall = argv.some(item => item === '-g' || item === '--global')
    const hasPkg = argv.some(item => !item.startsWith('-'))

    if (!hasPkg) {
      this.error('请确保移除至少一个包')
    }

    const command = (globalInstall ? ['uninstall'] : ['remove']).concat(argv)

    cli.action.start('移除依赖')

    try {
      this.debug(globalInstall ? 'npm' : 'yarn', command.join(' '))
      const code = await exec(globalInstall ? 'npm' : 'yarn', command, undefined, line => {
        this.debug(line)
      })
      this.debug(code)
      cli.action.stop(code === 0 ? '成功' : '失败')
    } catch (error) {
      cli.action.stop('失败')
      this.error(error.message)
    }
  }
}
