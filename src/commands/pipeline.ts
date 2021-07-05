import {Command, flags} from '@oclif/command'
import {runner, application} from '@listenai/lisa_core'
import {cli} from 'cli-ux'

export default class Pipeline extends Command {
  static strict = false

  static description = '执行pipeline，可执行的pipeline输入`lisa pipeline -T`命令查看';

  static args = [
    {
      name: 'id',
      required: false,
      description: 'pipleLine id',
    },
  ];

  static flags = {
    table: flags.boolean({
      char: 'T',
      description: '表格展示所有可执行的pipeline',
      default: false,
    }),
    json: flags.boolean({
      description: 'json展示所有可执行的pipeline',
      default: false,
    }),
  };

  async run() {
    const {args, flags} = this.parse(Pipeline)
    const tasks = Object.keys(application.pipeline).filter((pipelineId: string) => !['create'].includes(pipelineId)).map((pipelineId: string) => {
      return Object.assign(application.pipeline[pipelineId], {id: pipelineId})
    })
    if (flags.table) {
      cli.table(tasks, {
        id: {
          minWidth: 7,
        },
        desc: {
          minWidth: 7,
        },
        tasks: {
          minWidth: 7,
          get: row => row.tasks.join(', '),
        },
      }, {
        printLine: this.log,
        ...flags, // parsed flags
      })
    } else if (flags.json) {
      this.log(JSON.stringify(tasks))
    } else if (args.id) {
      if (Object.keys(application.pipeline).includes(args.id)) {
        runner(application.pipeline[args.id].tasks.join(','))
      } else {
        this.error('请输入正确的pipeline id，可输入lisa pipeline -T查看可运行的pipeline')
      }
    } else {
      this.error('请输入需要执行的pipeline id，可输入lisa pipeline -T查看可运行的pipeline')
    }
  }
}
