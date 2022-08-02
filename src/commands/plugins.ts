import { Command } from '@oclif/command'
import lisa from '@listenai/lisa_core'
import { listPlugins } from '../util/plugins'

export default class Uninstall extends Command {
  static description = '查看lisa扩展包'

  static strict = false

  async run() {
    const { cli } = lisa
    const plugins = await listPlugins();
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
