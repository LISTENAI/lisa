import { Command } from '@oclif/command'
import lisa from '@listenai/lisa_core'
import * as os from 'os'
import * as path from 'path'
import lpmPkgVersion from '../util/lpmPkgVersion'
import User from '../util/user'
import * as Configstore from 'configstore'
import compare from '../util/compare'
import { getPlugin, getPluginByFriendlyName, IPluginMain } from '../util/plugins'

export default class Info extends Command {
  static description = '查看环境信息'

  static args = [
    {
      name: 'pluginName',
      required: false,
      description: "检查的目标项目，例：'zephyr'，不填时默认检查默认环境",
    },
  ]

  static strict = false
  //检查zephyr更新

  async checkZephyrUpdate(currentVersion: string, latestVersion: string) {
    const { cli, cmd } = lisa
    if (compare(currentVersion, latestVersion) < 0) {

      const {got} = lisa
      let result: any = {};
  
      const requestUrl = `https://castor.iflyos.cn/castor/v3/lisaPlugin/version?name=@lisa-plugin/zephyr&version=${latestVersion}`;
      try {
        const {body}: {body: any} = await got(requestUrl, {
          responseType: "json",
          timeout: 3000
        });
        result = body.data.releaseNotes;
      } catch (gotError) {
      }
      if (result) {
        console.log(`=== Latest Relaese Notes ===`);
        console.log(result.join('\n'));
      }
      const isUpdate: boolean = await cli.confirm(`发现 'lisa zep 命令行工具' 有可更新的版本: ${latestVersion}，是否需要更新(Y/N )?`)
      if (isUpdate) {
        await cmd('lisa', ['update', 'zephyr'], { stdio: 'inherit' })
      }
    }

  }
  async getVersion(arg: string) {
    const { cmd } = lisa
    const { stdout } = await cmd(arg, ['--version'])
    return stdout
  }

  async getplugin() {
    const { fs } = lisa
    const { args } = this.parse(Info)
    let targetPluginName = args?.pluginName
    this.log(`\nOperating System - ${(os as any).version()}, version ${os.release()} ${os.arch()} \n`)
    this.log(`@listenai/lisa - ${this.config.version}\n`)

    const config = new Configstore('lisa')
    const lisaUserInfo = config.get('userInfo') || {}
    let accountInfo
    try {
      const loginInfo = await User.getUserInfo(lisaUserInfo?.accessToken) as any
      accountInfo = loginInfo && loginInfo?.data && `${loginInfo?.data?.account}(${loginInfo?.data?.email})`
    } catch (error) {
      accountInfo = '未登录或登录已过期'
    }
    this.log(`Account - ${accountInfo}\n`)
    this.log(
      'Node.js environment \n' +
      `  Node.js - ${await this.getVersion('node')}\n` +
      `  npm - ${await this.getVersion('npm')}\n` +
      `  yarn - ${await this.getVersion('yarn')}\n`
    )

    if (targetPluginName) {
      const plugin = await getPlugin(targetPluginName) || await getPluginByFriendlyName(targetPluginName)
      if (plugin) {
        const engines = plugin.package.engines
        if (engines) {
          const items = Object.keys(engines).filter(item => !['node', 'npm'].includes(item))
          if (items.length > 0) {
            this.log('Global environment')
            const versions = await Promise.all(
              items.map(item => {
                return this.getVersion(item)
              })
            )
            let enginesLog = ''
            items.forEach((key, index) => {
              const satisfies = require('semver/functions/satisfies')
              let msg = ''
              try {
                if (!satisfies(versions[index].match(/(\d\d|\d)(.(\d\d|\d)){1,2}$/g)[0] || '', engines[key])) {
                  msg = `(error: ${key} need version ${engines[key]})`
                }
              } catch (error) {

              }
              enginesLog += `  ${key} - ${versions[index]} ${msg}\n`
            })
            this.log(enginesLog)
          }
        }

        // 展示plugin版本
        const pluginLatestVersion = await lpmPkgVersion(plugin.name)
        const pluginVersion = plugin.package.version || ''
        this.log(
          'Plugin info \n' +
          `  ${targetPluginName} - ${pluginVersion} (latest: ${pluginLatestVersion})\n`
        )

        if (plugin.package.main) {
          // main入口获取沙箱env环境
          const mainPath = path.join(plugin.root, plugin.package.main)
          if (await fs.pathExists(mainPath)) {
            const main: IPluginMain = await import(mainPath)
            if (typeof main.env == 'function') {
              const pluginEnv = await main.env()
              this.log(
                'Plugin environment \n' +
                Object.keys(pluginEnv).map(key => {
                  return `  ${key} - ${pluginEnv[key]}`
                }).join('\n') +
                '\n'
              )
            }
          }
        }

        //zephyr 检查更新
        if (plugin.name === '@lisa-plugin/zephyr') {
          await this.checkZephyrUpdate(pluginVersion, pluginLatestVersion)
        }
      }
    }
  }

  async run() {
    const that = this
    try {
      Promise.race([
        new Promise<void>(async (resolve, _) => {
          await that.getplugin()
          resolve()
        })
        // new Promise((_, reject) => {
        //   setTimeout(function () {
        //     reject()
        //     throw new Error('The operation has timed out')
        //   }, 8000)
        // }),
      ]).then(() => {
        process.exit();
      }).catch(error => {
        this.log(error || 'some error occurred')
      })
    } catch (error) {
      this.error(error)
    }
  }

}
