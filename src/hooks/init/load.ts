import {Hook} from '@oclif/config'
import {load, Application, argv} from '@listenai/lisa_core'
import * as path from 'path'

const initLoad: Hook<'init'> = async function (options) {
  if (!['-v', '--version', '-h', '--help', 'install', 'search', 'view'].includes(options.id)) {
    require(path.join(__dirname, '../../tasks'))
    try {
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
