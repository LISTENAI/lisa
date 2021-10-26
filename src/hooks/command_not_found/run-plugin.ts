import {Hook} from '@oclif/config'
import lisa from '@listenai/lisa_core'
import {loadFileSync} from '@listenai/lisa_core'
import * as path from 'path'
import {ParsedArgs} from 'minimist'
import { threadId } from 'worker_threads'

const runPlugin: Hook<'command_not_found'> = async function (options) {
  const {cmd, fs, application, cli} = lisa
  let globalRoot = ''
  try {
    const result = await Promise.all([
      await cmd('npm', 'root -g'.split(' ')),
    ])
    globalRoot = result[0].stdout
  } catch (error) {
    this.debug(error)
  }

  const pluginsRoot = path.resolve(path.join(globalRoot, '@lisa-plugin'))
  let targetPluginJson: {
    [key: string]: any;
  } = {}
  let targetPluginDir = ''
  fs.readdirSync(pluginsRoot).forEach((dir: string) => {
    const data = fs.statSync(path.join(pluginsRoot, dir))
    if (data.isDirectory() && fs.existsSync(path.join(pluginsRoot, dir, 'package.json'))) {
      const pjson = fs.readJSONSync(path.join(pluginsRoot, dir, 'package.json'))
      if (pjson.lisa?.friendlyName === options.id) {
        targetPluginJson = pjson
        targetPluginDir = path.join(pluginsRoot, dir)
      } else if (dir === options.id) {
        targetPluginJson = pjson
        targetPluginDir = path.join(pluginsRoot, dir)
      }
    }
  })

  if (targetPluginJson?.lisa?.taskPath) {
    loadFileSync(path.join(targetPluginDir, targetPluginJson?.lisa?.taskPath))
  }
  if (targetPluginJson?.lisa?.configPath) {
    loadFileSync(path.join(targetPluginDir, targetPluginJson?.lisa?.configPath))
  }

  if (targetPluginDir) {
    const argv = process.argv.slice(2)
    if ((application.argv as ParsedArgs)._[0] === 'tasks') {
      const taskDict = application.tasks
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
      })
      this.exit()
    }

    await this.config.runCommand('task', argv)

    this.exit()
  }
}
export default runPlugin
