/* eslint-disable node/no-unsupported-features/node-builtins */
import {Command, flags} from '@oclif/command'

import {runner, cmd} from '@listenai/lisa_core'
import Utils from '../lib/utils'

export default class New extends Command {
  static description = '固件开发项目编译打包';

  static flags = {
    release: flags.boolean({
      char: 'r', // shorter flag version
      description: '打包release包', // help description for flag
      default: false,
    }),
    factory: flags.boolean({
      description: '打包factory包', // help description for flag
      default: false,
    }),
  };

  async run() {
    const self = this
    const {flags} = this.parse(New)
    const {release, factory} = flags

    // const {runner, cmd} = await import('@listenai/lisa_core')

    return runner(Utils.getPipelineTask('build')).then(async () => {
      if (release) {
        await runner('build:release')
      }
      if (factory) {
        await runner('build:factory', {}, true)
      }
    }).catch((error: any) => {
      self.error(error)
    })
  }
}
