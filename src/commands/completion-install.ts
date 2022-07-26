import Command from '@oclif/command';
import * as tabtab from 'tabtab';

export default class InstallCompletion extends Command {
  static description = '安装命令补全';

  static args = [];

  async run() {
    await tabtab.install({
      name: 'lisa',
      completer: 'lisa',
    });
  }
}
