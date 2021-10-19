import {Hook} from '@oclif/config'
import {argv, getTaskDict, loadPreRunTask} from '@listenai/lisa_core'
import lisa from '@listenai/lisa_core'

const runTask: Hook<'command_not_found'> = async function (options) {
  const taskDict = getTaskDict()
  const hasTask = taskDict[options.id]
  if (hasTask) {
    lisa.application.argv = argv(process.argv.slice(2))
    await loadPreRunTask()
    await this.config.runCommand('task', process.argv.slice(2))
    this.exit()
  }
}
export default runTask
