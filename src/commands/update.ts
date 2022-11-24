import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import compare from '../util/compare'
import lpminit from '../util/lpminit'
import download from '@xingrz/download2';
import {resolve} from "path";

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
      let channelLatestVersion: string = channel === 'beta' ? distTags.beta : distTags.latest;
      if (process.env.LISA_DUMMY_VERSION) {
        channelLatestVersion = process.env.LISA_DUMMY_VERSION;
      }
      this.debug('最新版本: %s, 通道: %s', channelLatestVersion, channel)

      //check if current version
      if (compare(currentVersion, channelLatestVersion) >= 0) {
        return cli.action.stop(`已是最新版本 ${currentVersion}`)
      }

      //check if eup is available
      let eupUrl = '';
      this.debug('Checking for EUP...')
      const isBeta: Number = channel === 'beta' ? 1 : 0;
      const eupResult = await this.getEUPInfo(wantUpdatePkg, channelLatestVersion, isBeta);
      if (eupResult.recode === '000000') {
        if (compare(currentVersion, eupResult.data.expressBaseVersion) >= 0) {
          this.debug(`EUP available! ver = ${eupResult.data.version}, baseVer = ${eupResult.data.expressBaseVersion}`);
          eupUrl = eupResult.data.expressPackageUrl.replace(".7z", ".zip");
        } else {
          this.debug(`EUP available but current version does not meet base version requirement. ver = ${eupResult.data.version}, baseVer = ${eupResult.data.expressBaseVersion}`);
        }
      } else {
        this.debug(`EUP unavailable! code = ${eupResult.recode}, msg = ${eupResult.desc}`)
      }

      if (eupUrl.length > 'https://'.length) {
        //if eup is available, download it and install
        cli.action.stop(`开始更新${wantUpdatePkg}@${channelLatestVersion} (EUP)`);
        cli.action.start('正在下载与部署');
        const pluginPath = await this.getPluginPath(wantUpdatePkg);
        await download(eupUrl, pluginPath, {
          extract: true
        });
        cli.action.stop('完成！');
      } else {
        //or, run npm things
        cli.action.stop(`开始更新${wantUpdatePkg}@${channelLatestVersion} (NPM)`)
        command = ['install', `${wantUpdatePkg}@${channelLatestVersion}`, '-g']
        await cmd('npm', registry ? command.concat(registry) : command, {
          shell: true,
          stdio: 'inherit',
        })
        this.log('成功')
      }
    } catch (error) {
      throw error
    }
  }

  async getPluginVersion(pluginName: string) {
    if (pluginName === '@listenai/lisa') {
      return this.config.version
    }

    const {cmd} = lisa
    const query = [ 'ls', pluginName, '--json', '-g' ];
    const resultRaw = (await cmd('npm', query)).stdout;
    const result = JSON.parse(resultRaw);

    return result['dependencies'][pluginName]['version'] ?? '-.-.-';
  }

  async getEUPInfo(name: string, expectedVersion: string, isBeta: Number) {
    const {got} = lisa
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

  async getPluginPath(name: string) {
    return resolve((process.env.LISA_HOME || ""), 'lisa', 'node_modules', name);
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
