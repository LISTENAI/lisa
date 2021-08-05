import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import * as Configstore from 'configstore'

export default class Login extends Command {
  static description = '登录'

  static AUTH_RELAY_SERVER = process.env.LISA_SERVER_HOST || 'https://castor.iflyos.cn'

  static SERVER_PREFIX = '/castor/v3'

  static CLIENT_ID = process.env.LISA_CLIENT_ID || '6d7bfd73-98ef-4c31-b39a-7601198e9b9c'

  async clientCredential() {
    return {
      token_code: 'b8f744f2-cd14-4d55-a6be-821ab7664ba6',
      url: 'https://aaaa.ccc',
    }
  }

  async getAccessToken(token_code: string) {
    // const {got} = lisa
    let count = 1
    return new Promise((resolve, _reject) => {
      const timmer = setInterval(async () => {
        count++
        if (count >= 5) {
          clearInterval(timmer)
          resolve(false)
        }
        try {
          // const res = await got(String(token_code))
          // res.body
          clearInterval(timmer)
          resolve(token_code)
        } catch (error) {

        }
      }, 3000)
    })
  }

  async getUserInfo(accessToken: string) {
    const {got} = lisa
    const res = await got(`${Login.AUTH_RELAY_SERVER}${Login.SERVER_PREFIX}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'LStudio',
      },
      responseType: 'json',
    })

    this.debug(res.body)

    return res.body
  }

  async getLSCloudToken(accessToken: string) {
    const {got} = lisa
    const res = await got(`${Login.AUTH_RELAY_SERVER}/auth_server/account/lscloud/token`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'LStudio',
      },
      responseType: 'json',
    })

    this.debug(res.body)

    return res.body
  }

  async run() {
    const {cli} = lisa

    const {token_code, url} = await this.clientCredential()

    this.log('请使用手机浏览器扫描以下二维码进行登录')
    const qrcode = require('qrcode-terminal')
    qrcode.generate(url, {small: true}, qr => {
      this.log(qr)
    })
    cli.action.start('等待登录授权...')
    const accessToken = await this.getAccessToken(token_code)

    if (accessToken === false) {
      this.error('登录超时或失败')
    }
    cli.action.start('登录授权成功，正在保存用户信息...')

    const result = await Promise.all([
      this.getUserInfo(String(accessToken)),
      this.getLSCloudToken(String(accessToken)),
    ])

    this.debug(result)

    const user: {
      [key: string]: any;
    } = (result[0] as any).data

    const lscloudUser: {
      [key: string]: any;
    } = result[1]

    const userInfo = {
      id: user.userId,
      accountName: user.account,
      username: user.englishName || '',
      email: user.email || '',
      accessToken: accessToken,
      password: accessToken,
      base64Token: Buffer.from(accessToken).toString('base64'),
      expire: new Date().getTime() + (user.tokenExpiresIn * 1000),
      lscloudUserName: lscloudUser.username,
      lscloudPassword: lscloudUser.token,
    }
    this.debug(userInfo)

    const config = new Configstore('lisa')
    config.set('userInfo', userInfo)

    await cli.wait(3000)
    cli.action.stop('完成')
  }
}
