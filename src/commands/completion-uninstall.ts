import Command from '@oclif/command';
import * as tabtab from 'tabtab';

export default class UninstallCompletion extends Command {
  static description = '卸载命令补全';

  static args = [];

  async run() {
    await tabtab.uninstall({
      name: 'lisa',
    });
  }
}
