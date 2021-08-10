import {Hook} from '@oclif/config'
import * as Configstore from 'configstore'
import User from '../../util/user'

const ONE_DAY = 86400000

const initOauth: Hook<'init'> = async function (_options) {
  const config = new Configstore('lisa')
  const lisaUserInfo = config.get('userInfo')
  this.debug(lisaUserInfo)
  if (lisaUserInfo?.expire && lisaUserInfo?.expire - (ONE_DAY * 10) < new Date().getTime()) {
    await User.refreshToken()
  }
}

export default initOauth
