import * as Configstore from 'configstore'
import lisa from '@listenai/lisa_core'

async function lpminit() {
  const {application, cmd} = lisa
  const config = new Configstore('lisa')
  const lisaUserInfo = config.get('userInfo')
  application.debug(lisaUserInfo)
  const registry = application.registryUrl.replace('https:', '')
  try {
    await cmd('npm', ['config', 'set', 'registry', process.env.LISA_NPM_REGISTRY || 'https://registry.npm.taobao.org'])
    application.debug('npm', ['set', `${registry}/:username=${lisaUserInfo.username}`].join(' '))
    await cmd('npm', ['set', `${registry}/:username=${lisaUserInfo.username}`])
    application.debug('npm', ['set', `${registry}/:_password=${lisaUserInfo.base64Token}`].join(' '))
    await cmd('npm', ['set', `${registry}/:_password=${lisaUserInfo.base64Token}`])
    application.debug('npm', ['set', `${registry}/:email=${lisaUserInfo.email}`].join(' '))
    await cmd('npm', ['set', `${registry}/:email=${lisaUserInfo.email}`])
    application.debug('npm', ['set', `${registry}/:always-auth=true`].join(' '))
    await cmd('npm', ['set', `${registry}/:always-auth=true`])
  } catch (error) {
    if (error.message.indexOf('username')) {
      throw new Error('请先登录，执行`lisa login`')
    }
  }
}

export default lpminit
