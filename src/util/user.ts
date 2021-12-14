import * as Configstore from 'configstore'
import lisa from '@listenai/lisa_core'

export default class User {
  static AUTH_RELAY_SERVER = process.env.LISA_SERVER_HOST || 'https://castor.iflyos.cn'

  static SERVER_PREFIX = '/castor/v3'

  static CLIENT_ID = process.env.LISA_CLIENT_ID || '6d7bfd73-98ef-4c31-b39a-7601198e9b9c'

  static CLIENT_SECRET = process.env.LISA_CLIENT_SECRET || 'a8e8e4f4-99a2-4815-8926-93a4b4721412'

  static async refreshToken() {
    const {application, got} = lisa
    const config = new Configstore('lisa')
    const lisaUserInfo = config.get('userInfo')

    if (lisaUserInfo?.refreshToken) {
      application.debug(`${User.AUTH_RELAY_SERVER}/auth_server/oauth/token?grant_type=refresh_token&refresh_token=${lisaUserInfo?.refreshToken}&client_id=${User.CLIENT_ID}&client_secret=${User.CLIENT_SECRET}`)
      const {body}: {
        body: {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };
      } = (await got.post(`${User.AUTH_RELAY_SERVER}/auth_server/oauth/token?grant_type=refresh_token&refresh_token=${lisaUserInfo?.refreshToken}&client_id=${User.CLIENT_ID}&client_secret=${User.CLIENT_SECRET}`, {
        responseType: 'json',
      }))
      lisaUserInfo.accessToken = body.access_token
      lisaUserInfo.password = body.access_token
      lisaUserInfo.base64Token = Buffer.from(body.access_token).toString('base64')
      lisaUserInfo.refreshToken = body.refresh_token
      lisaUserInfo.expire = new Date().getTime() + (body.expires_in * 1000)
      config.set('userInfo', lisaUserInfo)
    }
  }

  static async getUserInfo(accessToken: string) {
    const {got} = lisa
    const res = await got(`${User.AUTH_RELAY_SERVER}${User.SERVER_PREFIX}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'LStudio',
      },
      responseType: 'json',
    })
    return res.body
  }
}
