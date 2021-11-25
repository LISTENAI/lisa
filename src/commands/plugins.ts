import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import * as path from 'path'

export default class Uninstall extends Command {
  static description = '查看lisa扩展包'

  static strict = false

  scopeName = '@lisa-plugin/'

  friendlyName(name) {
    return name.replace(this.scopeName, '')
  }

  async run() {
    const {cli, cmd, fs} = lisa
    // let globalDependencies = {}
    const plugins = []
    let globalRoot = ''
    try {
      const result = await Promise.all([
        // await cmd('npm', 'list -g --depth 0 --json'.split(' ')),
        await cmd('npm', 'root -g'.split(' ')),
      ])
      // globalDependencies = JSON.parse(result[0].stdout).dependencies
      globalRoot = result[0].stdout
    } catch (error) {
      this.debug(error)
    }
    const pluginsRoot = path.resolve(path.join(globalRoot, this.scopeName))
    if (await fs.pathExists(pluginsRoot)) {
      fs.readdirSync(pluginsRoot).forEach((dir: string) => {
        const data = fs.statSync(path.join(pluginsRoot, dir))
        if (data.isDirectory() && fs.existsSync(path.join(pluginsRoot, dir, 'package.json'))) {
          const pjson = fs.readJSONSync(path.join(pluginsRoot, dir, 'package.json'))
          plugins.push({
            name: `${this.scopeName}${dir}`,
            friendlyName: pjson?.lisa?.friendlyName || dir,
            version: pjson.version,
          })
        }
      })
    }

    // plugins = Object.keys(globalDependencies).filter(item => item.startsWith(this.scopeName)).map(item => {
    //   return Object.assign(globalDependencies[item], {
    //     friendlyName: this.friendlyName(item),
    //     path: path.resolve(path.join(globalRoot, item)),
    //   })
    // })
    this.debug(plugins)
    cli.table(plugins, {
      name: {
        header: 'Name',
      },
      friendlyName: {
        header: 'friendlyName',
      },
      version: {
        header: 'Version',
      },
    })
  }
}
