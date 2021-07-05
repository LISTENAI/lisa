import {Hook} from '@oclif/config'
import defaultPath from '../../../util/default-path'
import cookie from '../../../util/cookie'
import * as fs from 'fs'

const csk: Hook<'init'> = async function (options) {
  const ACCESS_TOKEN = await cookie.get('ACCESS_TOKEN')
  if (!ACCESS_TOKEN) {
    this.error('请先在Lstudio进行登录')
  }
  if (['install'].includes(options.id || '') && !fs.existsSync(defaultPath.cwd('project.csk'))) {
    this.error(`请在csk开发项目中执行lisa ${options.id}命令`)
  }
}

export default csk
