import {Command, flags} from '@oclif/command'
import lisa from '@listenai/lisa_core'

export default class Build extends Command {
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
    const {runner, application} = lisa

    const {flags} = this.parse(Build)
    const {release, factory} = flags

    return runner(application.pipeline.build.tasks.join(',')).then(async () => {
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
