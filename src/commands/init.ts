/* eslint-disable node/no-unsupported-features/node-builtins */
import {Command} from '@oclif/command'
import Utils from '../lib/utils'

import {runner} from '@listenai/lisa_core'

export default class Init extends Command {
  static description = '项目初始化';

  async run() {
    const self = this
    return runner(Utils.getPipelineTask('init')).catch((error: any) => {
      self.error(error)
    })
  }
}
