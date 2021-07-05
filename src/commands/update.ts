import {Command} from '@oclif/command'
import {cmd} from '@listenai/lisa_core'
import cli from 'cli-ux'

export default class Update extends Command {
  static description = '更新lisa到最新版本'

  async run() {
    cli.action.start('正在更新到最新版本...')
    const oldVersion = await cmd('lisa', ['--version'])
    let registry = 'https://registry.npm.taobao.org'
    if (process.env.LISA_ENV === 'debug') {
      this.log('当前为DEBUG环境，将更新到lpm的最新版本')
      registry = 'https://registry-lpm.listenai.com'
    }
    await cmd('npm', ['install', '@listenai/lisa@latest', '-g', `--registry=${registry}`])
    const newVersion = await cmd('lisa', ['--version'])
    if (oldVersion.stdout === newVersion.stdout) {
      cli.action.stop('当前已是最新版本')
    } else {
      cli.action.stop('成功')
    }
    this.log(newVersion.stdout)
  }
}
