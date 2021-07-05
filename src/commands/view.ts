import {Command} from '@oclif/command'
import lmp from '../util/lmp'
import {cmd} from '@listenai/lisa_core'

export default class View extends Command {
  static description = '查看pkg相关信息'

  static args = [
    {
      name: 'pkg',
      description: '包名，如`@listenai/lisa`',
      required: true,
    },
    {
      name: 'field',
      required: false,
      description: '查看包的相关信息，如`versions`,`dependencies`',
      default: 'versions',
    },
  ]

  async run() {
    const {args} = this.parse(View)
    const pkgName = args.pkg
    const versions = args.field
    const cmdArr = await lmp.view(pkgName, versions)
    const res = await cmd(cmdArr.shift(), cmdArr)
    this.log(res.stdout)
  }
}
