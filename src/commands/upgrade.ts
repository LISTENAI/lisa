import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import lpminit from '../util/lpminit'

export default class Upgrade extends Command {
  static description = '更新当前项目依赖'

  static strict = false

  async run() {
    const {application, cli, exec} = lisa
    const {argv} = this.parse(Upgrade)
    const hasRegistry = argv.some(item => item.startsWith('--registry='))

    const command = ['upgrade'].concat(argv)
    cli.action.start('更新当前项目依赖', '正在更新', {stdout: true})
    if (!hasRegistry) {
      command.push(`--registry=${application.registryUrl}`)
      await lpminit()
    }

    this.debug(command.join(' '))
    try {
      this.debug('yarn', command.join(' '))
      const code = await exec('yarn', command, undefined, line => {
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
