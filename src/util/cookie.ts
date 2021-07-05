import * as fs from 'fs'
import * as path from 'path'

const cookie = {
  get: async (key: string) => {
    const cookiePath = path.join(process.env.ListenAiCachePath || '', 'cookie', 'cookie')
    if (!fs.existsSync(cookiePath)) {
      return null
    }
    const content = fs.readFileSync(cookiePath).toString()
    const cookies: any = {}
    content.split(';').forEach((item: string) => {
      const itemArr = item.split('=')
      if (itemArr[0] && itemArr[1]) {
        cookies[itemArr[0]] = itemArr[1]
      }
    })
    return cookies[key] || ''
  },
}

export default cookie
