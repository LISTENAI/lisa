import { Hook } from '@oclif/config'
import * as Configstore from 'configstore'
import User from '../../util/user'

const ONE_DAY = 86400000

const initOauth: Hook<'init'> = async function (_options) {
  const config = new Configstore('lisa')
  this.debug(config.path)
  const lisaUserInfo = config.get('userInfo') || {}
  this.debug(lisaUserInfo)
  if (!['login', '-v', '--version', '-h', '--help'].includes(_options.id)) {
    if (lisaUserInfo?.expire && lisaUserInfo?.expire - (ONE_DAY * 10) < new Date().getTime()) {
      try {
        await User.refreshToken()
      } catch (error) {
        this.error('登录已过期，请执行`lisa login`重新登录')
      }
    }
  }
}

export default initOauth
