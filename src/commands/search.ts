import {Command} from '@oclif/command'
import lmp from '../util/lmp'
import {cmd} from '@listenai/lisa_core'

export default class Search extends Command {
  static description = '根据关键字查找pkg'

  static args = [
    {
      name: 'keyword',
      required: true,
      description: "关键字，例：'tool'",
    },
  ]

  async run() {
    const {args} = this.parse(Search)
    const cmdArr = await lmp.search(args.keyword)
    const res = await cmd(cmdArr.shift(), cmdArr)
    this.log(res.stdout)
  }
}
