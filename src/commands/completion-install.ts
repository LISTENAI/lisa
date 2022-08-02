import Command from '@oclif/command';
import { resolve } from 'path';
import * as tabtab from 'tabtab';

export default class InstallCompletion extends Command {
  static description = '安装命令补全';

  static args = [];

  async run() {
    const node = process.argv[0];
    const script = resolve(__dirname, '../../lib/completion.js');
    await tabtab.install({
      name: 'lisa',
      completer: `${node} ${script}`,
    });
  }
}
