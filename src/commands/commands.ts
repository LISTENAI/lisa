import {Command, flags} from '@oclif/command'
import {ux} from 'cli-ux'
import * as _ from 'lodash'
import {EOL} from 'os'
import {cmd} from '@listenai/lisa_core'

type Dictionary = {[index: string]: object}
export default class Commands extends Command {
  static description = '展示所有的命令'

  static hidden = true

  static flags: flags.Input<any> = {
    help: flags.help({char: 'h'}),
    json: flags.boolean({char: 'j', description: 'display unfiltered api data in json format'}),
    hidden: flags.boolean({description: 'show hidden commands'}),
    ...ux.table.flags(),
  }

  async run() {
    const {flags} = this.parse(Commands)
    let commands = this.getCommands()
    if (!flags.hidden) {
      commands = commands.filter(c => !c.hidden)
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
    const pipelineRes = await cmd('lisa', ['pipeline', '--json'])
    const pipeList = JSON.parse(pipelineRes.stdout)

    if (flags.json) {
      let outputCmds = new Array(7)
      const sorts = ['help', 'create', 'build', 'flash', 'task', 'pipeline', 'install']
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

      this.log(JSON.stringify(outputCmds))
    } else {
      ux.table(commands.map((command: any) => {
        // Massage some fields so it looks good in the table
        command.description = (command.description || '').split(EOL)[0]
        command.hidden = Boolean(command.hidden)
        command.usage = (command.usage || '')
        return command
      }), {
        id: {
          header: 'Command',
        },
        description: {},
        usage: {
          extended: true,
        },
        pluginName: {
          extended: true,
          header: 'Plugin',
        },
        pluginType: {
          extended: true,
          header: 'Type',
        },
        hidden: {
          extended: true,
        },
      }, {
        printLine: this.log,
        ...flags, // parsed flags
      })
    }
  }

  private getCommands() {
    return this.config.commands
  }

  private removeCycles(object: unknown) {
    // Keep track of seen objects.
    const seenObjects = new WeakMap<Dictionary, undefined>()

    const _removeCycles = (obj: unknown) => {
      // Use object prototype to get around type and null checks
      if (Object.prototype.toString.call(obj) === '[object Object]') {
        // We know it is a "Dictionary" because of the conditional
        const dictionary = obj as Dictionary

        if (seenObjects.has(dictionary)) {
          // Seen, return undefined to remove.
          return undefined
        }

        seenObjects.set(dictionary, undefined)

        for (const key in dictionary) {
          // Delete the duplicate object if cycle found.
          if (_removeCycles(dictionary[key]) === undefined) {
            delete dictionary[key]
          }
        }
      } else if (Array.isArray(obj)) {
        for (const i in obj) {
          if (_removeCycles(obj[i]) === undefined) {
            // We don't want to delete the array, but we can replace the element with null.
            obj[i] = null
          }
        }
      }

      return obj
    }

    return _removeCycles(object)
  }
}
