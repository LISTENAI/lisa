import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import compare from '../util/compare'
import lpminit from '../util/lpminit'

export default class Update extends Command {
  static description = '更新lisa到最新版本'

  static args = [
    {
      name: 'plugin',
      required: false,
      description: "拓展包名，例：'zephyr'，不填时默认更新lisa自身",
    },
  ]

  async run() {
    const {cli, cmd, application} = lisa
    cli.action.start('更新启动...')
    const DEBUG = process.env.LISA_ENV === 'debug'
    const {args} = this.parse(Update)



    let wantUpdatePkg = '@listenai/lisa'
    let registry = ''
    let command = []
    if (args.plugin) {
      wantUpdatePkg = `@lisa-plugin/${args.plugin}`
      await lpminit()
      registry = `--registry=${application.registryUrl}`
    }

    if (DEBUG) {
      this.log(`当前环境为 beta，将更新到${wantUpdatePkg}的beta版本`)
      command = ['install', `${wantUpdatePkg}@beta`, '-g']
      await cmd('npm', registry ? command.concat(registry) : command, {
        shell: true,
        stdio: 'inherit',
      })
      return
    }

    const nowVersion = this.config.version
    this.debug('当前版本 %s', nowVersion)

    try {
      command = ['view', wantUpdatePkg, 'dist-tags']
      const res = await cmd('npm', registry ? command.concat(registry) : command)
      const distTags = JSON.parse(res.stdout.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"'))
      const latestVersion = distTags.latest
      this.debug('最新版本 %s', latestVersion)

      if (wantUpdatePkg === '@listenai/lisa' && compare(nowVersion, latestVersion) >= 0) {
        return cli.action.stop(`已是最新版本 ${nowVersion}`)
      }

      cli.action.stop(`开始更新${wantUpdatePkg}@${latestVersion}`)
      command = ['install', `${wantUpdatePkg}@latest`, '-g']
      await cmd('npm', registry ? command.concat(registry) : command, {
        shell: true,
        stdio: 'inherit',
      })
      this.log('成功')
    } catch (error) {
      throw error
    }
  }
}
