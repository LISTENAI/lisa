import * as Configstore from 'configstore'
import lisa from '@listenai/lisa_core'

async function lpminit() {
  const { application, cmd } = lisa
  const config = new Configstore('lisa')
  const lisaUserInfo = config.get('userInfo') || {}
  application.debug(lisaUserInfo)
  const registry = application.registryUrl.replace('https:', '')
  application.debug(lisaUserInfo)
  try {
    await Promise.all([
      await cmd('npm', ['config', 'set', 'registry', process.env.LISA_NPM_REGISTRY || 'https://registry.npm.taobao.org']),
      await cmd('npm', ['set', `${registry}/:username=${lisaUserInfo?.username}`]),
      await cmd('npm', ['set', `${registry}/:_password=${lisaUserInfo?.base64Token}`]),
      await cmd('npm', ['set', `${registry}/:email=${lisaUserInfo?.email}`]),
      await cmd('npm', ['set', `${registry}/:always-auth=true`])
    ])
  } catch (error) {
    if (error.message.indexOf('username')) {
      throw new Error('请先登录，执行`lisa login`')
    }
  }
}

export default lpminit
