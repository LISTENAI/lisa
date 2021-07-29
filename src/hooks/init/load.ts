import {Hook} from '@oclif/config'
import lisa from '@listenai/lisa_core'
import {load, argv} from '@listenai/lisa_core'

const initLoad: Hook<'init'> = async function (options) {
  if (['task'].includes(options.id || '')) {
    try {
      load()
      this.debug('load完')
      lisa.application.cacheDir = options.config.cacheDir
      lisa.application.argv = argv(options.argv)
      this.debug(lisa.application.argv)
    } catch (error) {
      this.error(error.message)
      // if (!(options.id === 'task' && options.argv.some(item => item === 'install:lisa_core'))) {
      //   this.error('当前目录是lisa项目，请先执行 `lisa task install:lisa_core` 安装核心库')
      // }
    }
  }
}

export default initLoad
