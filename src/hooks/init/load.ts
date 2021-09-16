import {Hook} from '@oclif/config'
import lisa from '@listenai/lisa_core'
import {argv, loadPreRunTask, load} from '@listenai/lisa_core'

const initLoad: Hook<'init'> = async function (options) {
  lisa.application.cacheDir = options.config.cacheDir
  lisa.application.argv = argv(options.argv)
  this.debug('参数: %s', JSON.stringify(lisa.application.argv))

  lisa.application.debug = `lisa:${options.id}`

  if (options.id === 'task' && lisa.application.argv._.length > 0) {
    loadPreRunTask()
    this.debug('loadPreRunTask end')
  }

  if (['build', 'flash'].includes(options.id)) {
    load()
    this.debug('load end')
  }
}

export default initLoad
