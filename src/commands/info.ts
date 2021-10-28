import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import * as os from 'os'
import * as path from 'path'

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

  async getVersion(arg: string) {
    const {cmd} = lisa
    const {stdout} = await cmd(arg, ['--version'])
    return stdout
  }

  async run() {
    const {cmd, fs} = lisa
    const {args} = this.parse(Info)
    const targetPluginName = args?.pluginName

    this.log(`\nOperating System - ${(os as any).version()}, version ${os.release()} ${os.arch()} \n`)
    this.log(`@listenai/lisa - ${this.config.version}\n`)
    this.log(
      'Node.js environment \n' +
      `  Node.js - ${await this.getVersion('node')}\n` +
      `  npm - ${await this.getVersion('npm')}\n` +
      `  yarn - ${await this.getVersion('yarn')}\n`
    )

    if (targetPluginName) {
      let globalRoot = ''
      try {
        const result = await Promise.all([
          await cmd('npm', 'root -g'.split(' ')),
        ])
        globalRoot = result[0].stdout
      } catch (error) {
        this.debug(error)
      }

      const pluginRoot = path.resolve(path.join(globalRoot, '@lisa-plugin', targetPluginName))
      if (fs.existsSync(path.join(pluginRoot, 'package.json'))) {
        // engines 获取global依赖环境
        const engines = fs.readJSONSync(path.join(pluginRoot, 'package.json'))?.engines
        if (engines) {
          const items = Object.keys(engines)
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
              if (!satisfies(versions[index].match(/(\d\d|\d)(.(\d\d|\d)){1,2}$/g)[0]||'', engines[key])) {
                msg = `(error: ${key} need version ${engines[key]})`
              }
              enginesLog += `  ${key} - ${versions[index]} ${msg}\n`
            })
            this.log(enginesLog)
          }
        }

        // main入口获取沙箱env环境
        const mainPath = fs.readJSONSync(path.join(pluginRoot, 'package.json'))?.main
        const main = require(path.join(pluginRoot, mainPath))
        if (main.env) {
          const pluginEnv = await main.env()
          this.log(
            'Project environment \n' +
            Object.keys(pluginEnv).map(key => {
              return `  ${key} - ${pluginEnv[key]}`
            }).join('\n') +
            '\n'
          )
        }
      }
    }
  }
}
