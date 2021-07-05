import {job, fs, application} from '@listenai/lisa_core'
import * as path from 'path'

module.exports = () => {
  job('flash:parse_zip', {
    title: '解析配置文件',
    task: ctx => {
      const {cskburn} = ctx.application.context
      // 解析manifest
      const dir = cskburn.lkpDirPath
      // 判断固件是否存在
      const imgExist = fs.existsSync(path.join(dir, 'burner.img'))
      // eslint-disable-next-line no-console
      console.log(`固件地址：${path.join(dir, 'burner.img')}`)
      if (imgExist) {
        const flashbootExist = fs.existsSync(path.join(dir, 'flashboot.bin'))
        const masterExist = fs.existsSync(path.join(dir, 'master.bin'))
        const scriptExist = fs.existsSync(path.join(dir, 'script.bin'))
        const respeakExist = fs.existsSync(path.join(dir, 'respak.bin'))

        const params: Array<string> = []
        // bin描述信息
        const binList: Array<string> = []

        if (flashbootExist) {
          const addr = '0'
          const filePath: string = path.join(dir, 'flashboot.bin')
          params.push(addr)
          params.push(filePath)
          binList.push(`flashboot(${addr})`)
        }

        if (masterExist) {
          const addr = '0x10000'
          const filePath: string = path.join(dir, 'master.bin')
          params.push(addr)
          params.push(filePath)
          binList.push(`manifest(${addr})`)
        }

        if (scriptExist) {
          const addr = '0xf0000'
          const filePath: string = path.join(dir, 'script.bin')
          params.push(addr)
          params.push(filePath)
          binList.push(`script(${addr})`)
        }

        if (respeakExist) {
          const addr = '0x100000'
          const filePath: string = path.join(dir, 'respak.bin')
          params.push(addr)
          params.push(filePath)
          binList.push(`respak(${addr})`)
        }

        ctx.params = params
        ctx.binList = binList

        application.log(`${params}`)
      } else {
        throw new Error('读取manifest.json文件失败')
      }
    },
  })
}
