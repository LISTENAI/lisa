import fetch from 'node-fetch'
import {Iresponse} from '../data'
import cookie from './cookie'

export default async (options: { url: string; method: any; body?: any }): Promise<Iresponse> => {
  const url = options.url.indexOf('http') >= 0 ? options.url : `https://castor.iflyos.cn/castor/v3${options.url}`
  const fetchOption: any = {
    method: options.method,
    headers: {
      authorization: `Bearer ${await cookie.get('ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      'X-Version': '2.2.2',
    },
    body: JSON.stringify(options.body),
    timeout: 15000,
  }
  try {
    const response: any = await fetch(encodeURI(url), fetchOption)
    const resJson = await response.json()
    const res = {
      code: response.status,
      res: resJson,
    }
    if (res.code === 200) {
      if (res.res.recode && res.res.recode !== '000000') {
        return {
          err: res.res.recode,
          data: res.res.data,
        }
      }
      return {
        err: 0,
        data: res.res.data,
      }
    }
  } catch (error) {
    return {
      err: 504,
      data: {message: '连接失败，请检查网络'},
    }
  }
  return {
    err: 504,
    data: {message: '连接失败，请检查网络'},
  }
}
