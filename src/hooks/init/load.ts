import {Hook} from '@oclif/config'
import {load, Application, argv} from '@listenai/lisa_core'
import * as path from 'path'
const debug = require('debug')('update-check')

const initLoad: Hook<'init'> = async function (options) {

  if (!['-v', '--version', '-h', '--help', 'install', 'search', 'view'].includes(options.id)) {
    import(path.join(__dirname, '../../tasks'))
      .then(() => debug("imported tasks done"))
      .catch(err => debug(err))

    try {
      //TODO: 后续把lisa core中的load改造成异步模式
      const application: any = load().application
      application.cacheDir = options.config.cacheDir
      application.argv = argv()
      const fs: any = load().fs;
      ((global as any).application as Application) =  application;
      ((global as any).fs) =  fs
    } catch (error) {
      if (!(options.id === 'task' && options.argv.some(item => item === 'install:lisa_core'))) {
        this.error('当前目录是lisa项目，请先执行 `lisa task install:lisa_core` 安装核心库')
      }
    }
  }
}

export default initLoad
