import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import compare from '../util/compare'
import lpminit from '../util/lpminit'

export default class Update extends Command {
  static description = '更新lisa到最新版本'

  async run() {
    const {cli, cmd} = lisa
    cli.action.start('正在更新到最新版本...')
    const DEBUG = process.env.LISA_ENV === 'debug'
    const nowVersion = this.config.version
    this.debug('当前版本 %s', nowVersion)
    await lpminit()

    if (DEBUG) {
      this.log('当前环境为 beta，将安装更新beta版本')
      await cmd('npm', ['install', '@listenai/lisa@beta', '-g'])
      return
    }

    const res = await cmd('npm', ['view', '@listenai/lisa', 'dist-tags'])

    try {
      const distTags = JSON.parse(res.stdout.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"'))
      const latestVersion = distTags.latest
      this.debug('最新版本 %s', latestVersion)

      if (compare(nowVersion, latestVersion) >= 0) {
        return cli.action.stop(`已是最新版本 ${nowVersion}`)
      }

      await cmd('npm', ['install', '@listenai/lisa@latest', '-g'])
      cli.action.stop('成功')
    } catch (error) {
      this.debug(error)
    }
  }
}
