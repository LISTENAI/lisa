import {Hook} from '@oclif/config'
import config from '../../config'
import {argv, got} from '@listenai/lisa_core'

const initOauth: Hook<'init'> = async function (options) {
  if (!['-v', '--version', '-h', '--help'].includes(options.id)) {
    const allArgv = JSON.parse(JSON.stringify(argv()))
    const allArguments = allArgv._.filter((item, index) => index !== 0)
    delete allArgv._
    const accessToken = config.get('lisaUserInfo')?.accessToken
    if (accessToken) {
      try {
        await got.post('https://open.listenai.com/event_upload', {
          timeout: 1000,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'LISA-VERSION': options.config.version,
          },
          json: {
            event_type: 'lisa_action',
            command: options.id,
            arguments: JSON.stringify(allArguments),
            flags: JSON.stringify(allArgv),
          },
          responseType: 'json',
        })
      } catch (error) {}
    }
  }
}

export default initOauth
