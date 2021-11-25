import {Hook} from '@oclif/config'
import {argv} from '@listenai/lisa_core'
import got from 'got/dist/source'
import * as Configstore from 'configstore'
const config = new Configstore('lisa')

const event: Hook<'init'> = async function (options) {
  if (!['login', 'create', '-v', '--version', '-h', '--help'].includes(options.id)) {
    const allArgv = JSON.parse(JSON.stringify(argv()))
    const allArguments = allArgv._.filter((item, index) => index !== 0)
    delete allArgv._
    let accessToken = config.get('userInfo')?.accessToken
    const params = {
      event_type: 'lisa_action',
      command: options.id,
      arguments: JSON.stringify(allArguments),
      flags: JSON.stringify(allArgv),
      source: 'lisa',
    }
    accessToken = 'asdf'
    if (accessToken) {
      try {
        this.debug('>>> 获取request [%s]：%s (%s)', options.id, JSON.stringify(params), accessToken)
        const response = await got.post('https://open.listenai.com/event_upload', {
          timeout: 1000,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'LISA-VERSION': options.config.version,
          },
          json: params,
          responseType: 'json',
        })

        this.debug(`>>> 响应: ${JSON.stringify(response.body)}`)
      } catch (error) {
        this.debug(`错误:${error}`)
      }
    }
  }
}

export default event
