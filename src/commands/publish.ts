import {Command} from '@oclif/command'
import lmp from '../util/lmp'
import cli from 'cli-ux'

export default class Publish extends Command {
  static description = '发布到lpm库'

  async run() {
    cli.action.start('发布前准备...')
    await lmp.publish(cli)
    // if (installRes) {
    //   cli.action.stop('成功')
    // }
  }
}
