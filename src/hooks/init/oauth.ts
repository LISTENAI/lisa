import {Hook} from '@oclif/config'
import config from '../../config'
import Utils from '../../lib/utils'
import cookie from '../../util/cookie'
import {application, got} from '@listenai/lisa_core'

const ONE_DAY = 86400000

async function getInfo() {
  let _password: any
  let _username: any
  let  _email: any
  let  _expire: any
  let accessToken = await cookie.get('ACCESS_TOKEN') || config.get('lisaUserInfo')?.accessToken
  if (!accessToken) {
    accessToken = process.env.LISA_ACCESS_TOKEN || Utils.getGlobal('application').lisaAccessToken || ''
  }
  if (accessToken) {
    _password = accessToken
    const _apiHost = Utils.getGlobal('application').apiHost || application.apiHost
    const _apiPrefix = Utils.getGlobal('application').apiPrefix || application.apiPrefix
    try {
      const res = await got(`${_apiHost}${_apiPrefix}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'LStudio',
        },
      })
      const body = JSON.parse(res.body)
      if (body.recode === '000000') {
        _username = body.data.englishName
        _email = body.data.email
        _expire = new Date().getTime() + (body.data.tokenExpiresIn * 1000)
      } else {
        config.set('lisaUserInfo', null)
        throw new Error('401 LISA_ACCESS_TOKEN 失效，请在Lstudio重新登录')
      }
    } catch (error) {
      config.set('lisaUserInfo', null)
      throw new Error('401 LISA_ACCESS_TOKEN 失效，请在Lstudio重新登录')
    }
  }

  if (!accessToken) {
    throw new Error('缺失LISA_ACCESS_TOKEN，请在Lstudio登录')
  }

  config.set('lisaUserInfo', {
    username: _username,
    accessToken: _password,
    password: _password,
    email: _email,
    expire: _expire,
  })
}

const initOauth: Hook<'init'> = async function (options) {
  // console.log(options)
  if (!['-v', '--version', '-h', '--help'].includes(options.id) && process.env.LISA_ENV !== 'factory') {
    if (!config.get('lisaUserInfo') || (config.get('lisaUserInfo').expire || 0) - ONE_DAY < new Date().getTime()) {
      await getInfo()
    }
    const _lpmRegistryUrl = Utils.getGlobal('application').lpmRegistryUrl || application.lpmRegistryUrl || '//registry-lpm.listenai.com'
    config.set('lpmRegistryUrl', _lpmRegistryUrl)
    config.set('lpmRc', `--registry=https:${_lpmRegistryUrl}`)
    application.log(options.id)
    application.log(config.path)
  }
}

export default initOauth
