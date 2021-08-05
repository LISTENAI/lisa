import * as Configstore from 'configstore'
import lisa from '@listenai/lisa_core'

async function lpminit() {
  const {application, cmd} = lisa
  const config = new Configstore('lisa')
  const lisaUserInfo = config.get('userInfo')
  application.debug(lisaUserInfo)

  await cmd('npm', ['set', `${application.registryUrl}/:username=${lisaUserInfo.username}`])
  await cmd('npm', ['set', `${application.registryUrl}/:_password=${lisaUserInfo.base64Token}`])
  await cmd('npm', ['set', `${application.registryUrl}/:email=${lisaUserInfo.email}`])
  await cmd('npm', ['set', `${application.registryUrl}/:always-auth=true`])
}

export default lpminit
