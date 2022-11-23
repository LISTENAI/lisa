import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import compare from '../util/compare'
import lpminit from '../util/lpminit'

export default class Update extends Command {
  static description = '更新lisa到最新版本'

  static CASTOR_URL_PREFIX = 'https://staging-castor.iflyos.cn/castor/v3'

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
    let channel = 'latest'
    if (args.plugin) {
      wantUpdatePkg = `@lisa-plugin/${args.plugin}`
      await lpminit()
      registry = `--registry=${application.registryUrl}`
    }
    if (DEBUG) {
      channel = 'beta'
    }

    const currentVersion = await this.getPluginVersion(wantUpdatePkg);
    if (currentVersion === '-.-.-') {
      throw new Error('此插件并未安装!')
    }
    this.debug('当前版本 %s', currentVersion)

    try {
      command = ['view', wantUpdatePkg, 'dist-tags']
      const res = await cmd('npm', registry ? command.concat(registry) : command)
      const distTags = JSON.parse(res.stdout.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"'))
      //const channelLatestVersion: string = channel === 'beta' ? distTags.beta : distTags.latest;
      const channelLatestVersion: string = '1.6.9';
      this.debug('最新版本: %s, 通道: %s', channelLatestVersion, channel)

      //check if current version
      if (compare(currentVersion, channelLatestVersion) >= 0) {
        return cli.action.stop(`已是最新版本 ${currentVersion}`)
      }

      //check for express package
      this.debug('Checking for express update package...')
      const isBeta: Number = channel === 'beta' ? 1 : 0;
      const expressUpdateResult = await this.getExpressUpdatePackageInfo(wantUpdatePkg, channelLatestVersion, isBeta);
      return cli.action.stop(JSON.stringify(expressUpdateResult));
    } catch (error) {
      throw error
    }
  }

  async getPluginVersion(pluginName: string) {
    if (pluginName === '@listenai/lisa') {
      return this.config.version
    }

    const {cmd} = lisa
    const query = [ 'ls', pluginName, '--json' ];
    const resultRaw = (await cmd('npm', query)).stdout;
    const result = JSON.parse(resultRaw);

    return result['dependencies'][pluginName]['version'] ?? '-.-.-';
  }

  async getExpressUpdatePackageInfo(name: string, expectedVersion: string, isBeta: Number) {
    const {cli, got} = lisa
    let result: any = {};

    const requestUrl = `${Update.CASTOR_URL_PREFIX}/lisaPlugin/version?name=${name}&version=${expectedVersion}&isBeta=${isBeta}`;
    try {
      const {body}: {body: any} = await got(requestUrl, {
        responseType: "json",
        timeout: 5000
      });
      result = body;
    } catch (gotError) {
      switch (gotError.code) {
        case 'ERR_NON_2XX_3XX_RESPONSE':
          result = gotError.response.body;
          break;
        default:
          throw gotError;
      }
    } finally {
      return result
    }
  }

  /*async run() {
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
  }*/
}
