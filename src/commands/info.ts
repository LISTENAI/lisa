import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import * as os from 'os'

export default class Uninstall extends Command {
  static description = '查看环境信息'

  static strict = false

  async getVersion(arg: string) {
    const {cmd} = lisa
    const {stdout} = await cmd(arg, ['--version'])
    return stdout
  }

  async run() {
    // const {cli, exec} = lisa

    this.log(`\nOperating System - ${(os as any).version()}, version ${os.release()} ${os.arch()} \n`)
    this.log(`@listenai/lisa - ${this.config.version}\n`)
    this.log(
      'Node.js environment \n' +
      `  Node.js - ${await this.getVersion('node')}\n` +
      `  npm - ${await this.getVersion('npm')}\n` +
      `  yarn - ${await this.getVersion('yarn')}\n`
    )
    this.log(
      'Global environment \n' +
      `  Python - ${await this.getVersion('python')}\n`
    )
  }
}
