import {Command, flags} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import {getTaskDict} from '@listenai/lisa_core'

export default class Task extends Command {
  static strict = false

  static description = '执行tasks，可执行的task输入`lisa task -T`命令查看';

  static args = [
    {
      name: 'ID',
      required: false,
      description: 'task id',
    },
  ];

  static flags = {
    table: flags.boolean({
      char: 'T',
      description: '表格展示所有可执行的task',
      default: false,
    }),
    json: flags.boolean({
      description: 'json展示所有可执行的task',
      default: false,
    }),
    verbose: flags.boolean({
      description: '日志全量输出',
      default: false,
    }),
  };

  async run() {
    const {cli} = lisa
    const {argv, flags} = this.parse(Task)
    let taskDict: {
      [key: string]: any;
    } = {}
    try {
      taskDict = getTaskDict()
    } catch (error) {
      taskDict = {}
    }

    if (flags.table) {
      const tasks = Object.keys(taskDict).map((taskId: string) => {
        return Object.assign(taskDict[taskId], {id: taskId})
      })
      cli.table(tasks, {
        id: {
          minWidth: 7,
        },
        name: {
          minWidth: 7,
          get: row => row.title,
        },
      }, {
        printLine: this.log,
        ...flags, // parsed flags
      })
    } else if (flags.json) {
      const tasks = Object.keys(taskDict).map((taskId: string) => {
        return Object.assign(taskDict[taskId], {id: taskId})
      })
      this.log(JSON.stringify(tasks))
    } else if (argv.length > 0) {
      try {
        await lisa.runner(argv.join(','), {}, flags.verbose || process.env.LISA_TASK_VERBOSE === 'true' || false)
      } catch (error) {
        this.error(error.message)
      }
    } else {
      this.error('请输入至少一个可执行的task')
    }
  }
}
