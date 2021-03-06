import {Command, flags} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import * as Configstore from 'configstore'
import User from '../util/user'
import lpminit from '../util/lpminit'

export default class Login extends Command {
  static description = '登录'

  static AUTH_RELAY_SERVER = process.env.LISA_SERVER_HOST || 'https://castor.iflyos.cn'

  static SERVER_PREFIX = '/castor/v3'

  static CLIENT_ID = process.env.LISA_CLIENT_ID || '6d7bfd73-98ef-4c31-b39a-7601198e9b9c'

  static REQUEST_TIMES = 100

  static flags = {
    token: flags.string({
      char: 't',
      description: 'AccessToken',
      required: false,
    }),
  };

  async clientCredential(): Promise<{ token_code: string; url: string }> {
    const {got} = lisa
    try {
      this.debug(`request->${`${Login.AUTH_RELAY_SERVER}/auth_server/oauth/gen_token_code?client_id=${Login.CLIENT_ID}`}`)
      const {body} = await got(`${Login.AUTH_RELAY_SERVER}/auth_server/oauth/gen_token_code?client_id=${Login.CLIENT_ID}`, {
        responseType: 'json',
      })
      this.debug(body)
      return body as { token_code: string; url: string }
    } catch (error) {
      this.error(error.message)
    }
  }

  async getAccessToken(token_code: string): Promise<{ access_token: string; refresh_token: string }> {
    const {got} = lisa
    let count = 1
    return new Promise((resolve, _reject) => {
      const timmer = setInterval(async () => {
        count++
        if (count >= Login.REQUEST_TIMES) {
          clearInterval(timmer)
          _reject()
        }
        try {
          const {body}: {body: any}  = await got(`${Login.AUTH_RELAY_SERVER}/auth_server/oauth/token_code/confirm?token_code=${token_code}`, {
            responseType: 'json',
          })
          this.debug(`token_code=${token_code}`)
          this.debug(body)
          if (body.access_token) {
            clearInterval(timmer)
            resolve({
              access_token: body.access_token,
              refresh_token: body.refresh_token,
            })
          }
        } catch (error) {
          this.debug(error.message)
        }
      }, 3000)
    })
  }

  // async getUserInfo(accessToken: string) {
  //   const {got} = lisa
  //   const res = await got(`${Login.AUTH_RELAY_SERVER}${Login.SERVER_PREFIX}/user`, {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //       'User-Agent': 'LStudio',
  //     },
  //     responseType: 'json',
  //   })

  //   this.debug(res.body)

  //   return res.body
  // }

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
    const {flags} = this.parse(Login)
    const {token} = flags

    let infoResult = null
    let accessToken = ''
    let refreshToken = ''

    if (!token) {
      const {token_code, url} = await this.clientCredential()
      this.log('请使用手机浏览器扫描以下二维码进行登录')
      const qrcode = require('qrcode-terminal')
      qrcode.generate(url, {small: true}, qr => {
        this.log(qr)
      })
      this.log(`或直接访问url进行登录：${url}`)
      cli.action.start('等待登录授权...')
      try {
        const {access_token, refresh_token} = await this.getAccessToken(token_code)
        accessToken = access_token
        refreshToken = refresh_token
        cli.action.start('登录授权成功，正在保存用户信息...')
      } catch (error) {
        this.error('登录超时或失败')
      }
    } else {
      accessToken = token
    }

    try {
      infoResult = await Promise.all([
        User.getUserInfo(String(accessToken)),
        this.getLSCloudToken(String(accessToken)),
      ])
    } catch (error) {
      this.error('获取用户信息失败')
    }

    this.debug(infoResult)

    const user: {
      [key: string]: any;
    } = (infoResult[0] as any).data

    const lscloudUser: {
      [key: string]: any;
    } = infoResult[1]

    const userInfo = {
      id: user.userId,
      accountName: user.account,
      username: user.englishName || '',
      email: user.email || '',
      accessToken: accessToken,
      refreshToken: refreshToken,
      password: accessToken,
      base64Token: Buffer.from(accessToken).toString('base64'),
      expire: new Date().getTime() + (user.tokenExpiresIn * 1000),
      lscloudUserName: lscloudUser.username,
      lscloudPassword: lscloudUser.token,
    }
    this.debug(userInfo)

    const config = new Configstore('lisa')
    config.set('userInfo', userInfo)

    await lpminit()

    cli.action.stop('完成')
    this.log('登录成功')
  }
}
