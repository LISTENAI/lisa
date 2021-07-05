import {Command, flags} from '@oclif/command'
import lmp from '../util/lmp'
import cli from 'cli-ux'

export default class Upgrade extends Command {
  static description = '更新当前项目依赖'

  static strict = false

  static flags = {
    latest: flags.boolean({
      description: '依赖更新到最新版本',
    }),
  }

  async run() {
    const {flags} = this.parse(Upgrade)
    cli.action.start('更新当前项目依赖', '正在更新', {stdout: true})

    const installRes = await lmp.upgrade(flags.latest)
    if (installRes) {
      cli.action.stop('成功')
    }
  }
}
