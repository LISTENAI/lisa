import {Command} from '@oclif/command'
import cpExec from '../util/cp-exec'
import defaultPath from '../util/default-path'

export default class List extends Command {
  static description = '列出项目已安装的Modules'

  async run() {
    cpExec.log('npm list', defaultPath.targetPath(), this)
  }
}
