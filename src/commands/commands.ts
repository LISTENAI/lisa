import {Command, flags} from '@oclif/command'
import * as _ from 'lodash'
import {EOL} from 'os'
import lisa from '@listenai/lisa_core'

export default class Commands extends Command {
  static description = '展示所有的命令'

  static hidden = true

  static flags: flags.Input<any> = {
    json: flags.boolean({char: 'j', description: 'display unfiltered api data in json format'}),
  }

  async run() {
    const {cmd} = lisa
    const {flags} = this.parse(Commands)
    let commands = this.getCommands()
    if (!flags.hidden) {
      commands = commands.filter(c => !c.hidden)
      commands = commands.filter(c => !c.id.startsWith('plugins'))
    }

    const config = this.config
    commands = _.sortBy(commands, 'id').map(command => {
      // Template supported fields.
      command.description = (typeof command.description === 'string' && _.template(command.description)({command, config})) || undefined
      command.usage = (typeof command.usage === 'string' && _.template(command.usage)({command, config})) || undefined
      return command
    })

    const taskRes = await cmd('lisa', ['task', '--json'])
    const taskList = JSON.parse(taskRes.stdout)
    // const pipelineRes = await cmd('lisa', ['pipeline', '--json'])
    // const pipeList = JSON.parse(pipelineRes.stdout)
    const pipeList = []

    if (flags.json) {
      let outputCmds = new Array(7)
      const sorts = ['help', 'create', 'build', 'flash', 'task', 'install']
      commands.forEach((command: any) => {
        // Massage some fields so it looks good in the table
        command.description = (command.description || '').split(EOL)[0]
        command.hidden = Boolean(command.hidden)
        command.usage = (command.usage || '')
        interface InewCommand {
          id: string;
          name: string;
          description?: string;
          action?: {
            type: string;
            cmd?: string;
            url?: string;
          };
          options?: InewCommand[];
        }
        let newCommand: InewCommand = {
          id: '',
          name: '',
        }
        switch (command.id) {
        case 'install':
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            options: [
              {
                id: `${command.id}-help`,
                name: 'help',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa install --help',
                },
              },
              {
                id: `${command.id}-install`,
                name: 'install（default）',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa install',
                },
              },
            ],
          }
          break
        case 'task':
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            options: [
              {
                id: `${command.id}-help`,
                name: 'help',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa task -T',
                },
              },
              ...(taskList.map((task: any) => {
                return {
                  id: `${command.id}-${task.id}`,
                  name: task.id,
                  action: {
                    type: 'run_cmd',
                    cmd: `lisa task ${task.id}`,
                  },
                }
              })),
            ],
          }
          break
        case 'pipeline':
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            options: [
              {
                id: `${command.id}-help`,
                name: 'help',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa pipeline -T',
                },
              },
              ...(pipeList.map((task: any) => {
                return {
                  id: `${command.id}-${task.id}`,
                  name: task.id,
                  action: {
                    type: 'run_cmd',
                    cmd: `lisa pipeline ${task.id}`,
                  },
                }
              })),
            ],
          }
          break
        case 'build':
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            options: [
              {
                id: `${command.id}-debug`,
                name: 'build debug',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa build',
                },
              },
              {
                id: `${command.id}-release`,
                name: 'build release',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa build --release',
                },
              },
            ],
          }
          break
        case 'flash':
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            options: [
              {
                id: `${command.id}-help`,
                name: 'help',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa flash --help',
                },
              },
              {
                id: `${command.id}-flash`,
                name: 'flash（default）',
                action: {
                  type: 'run_cmd',
                  cmd: 'lisa flash',
                },
              },
            ],
          }
          break

        case 'create':
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            action: {
              type: 'run_cmd',
              cmd: 'lisa create',
            },
          }
          break

        case 'login':
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            action: {
              type: 'run_cmd',
              cmd: 'lisa login',
            },
          }
          break

        default:
          newCommand = {
            id: command.id,
            name: command.id,
            description: command.description,
            action: {
              type: 'run_cmd',
              cmd: ['update'].includes(command.id) ? `lisa ${command.id}` : `lisa ${command.id} --help`,
            },
          }
          break
        }

        const sort = sorts.indexOf(command.id)
        if (sort >= 0) {
          outputCmds[sort] = newCommand
        } else {
          outputCmds.push(newCommand)
        }
      })

      outputCmds = outputCmds.filter((item: any) => !['help'].includes(item.name))

      outputCmds.unshift({
        id: 'help',
        name: 'help',
        description: 'help',
        action: {
          type: 'run_cmd',
          cmd: 'lisa --help',
        },
      })
      this.debug(outputCmds)
      this.log(JSON.stringify(outputCmds))
    }
  }

  private getCommands() {
    return this.config.commands
  }
}
