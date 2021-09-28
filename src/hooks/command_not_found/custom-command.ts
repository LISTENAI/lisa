import {Hook} from '@oclif/config'
import {getTaskDict, load} from '@listenai/lisa_core'

const customCommand: Hook<'command_not_found'> = async function (options) {
  const taskDict = getTaskDict()
  const hasTask = taskDict[options.id]
  if (hasTask) {
    await load()
    const argv = process.argv.slice(2)
    await this.config.runCommand('task', argv)

    this.exit()
  }
}
export default customCommand
