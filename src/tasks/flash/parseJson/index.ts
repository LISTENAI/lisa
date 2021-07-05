import {job, fs} from '@listenai/lisa_core'
import * as path from 'path'

module.exports = () => {
  job('flash:parse_json', {
    title: '解析配置文件',
    task: ctx => {
      const {cskburn} = ctx.application.context
      // 解析manifest
      const dir = cskburn.lkpDirPath
      // 判断固件是否存在
      const jsonPath: string = path.join(dir, 'manifest.json')
      const manifestExist = fs.existsSync(jsonPath)
      if (manifestExist) {
        const params: Array<string> = []
        // bin描述信息
        const binList: Array<string> = []
        const jsonData = fs.readFileSync(jsonPath, 'utf-8')
        const json = JSON.parse(jsonData)
        // let burner: string = json.burner
        // burner = path.join(dir, burner)
        const images = json.images
        // params.push('-w')
        // params.push(burner)
        const partList = cskburn.parts.split(' ', 4)
        // eslint-disable-next-line guard-for-in
        if (partList.length === 0 || cskburn.parts === 'undefined' || cskburn.parts === '') {
          // eslint-disable-next-line guard-for-in
          for (const key in images) {
            const value = images[key]
            const addr = value.addr
            const file: string = value.file
            const filePath: string = file.replace('.', dir)
            // eslint-disable-next-line no-console
            params.push(addr)
            params.push(filePath)

            binList.push(`${key}(${addr})`)
          }
        } else {
          // eslint-disable-next-line guard-for-in
          for (const key in images) {
            const value = images[key]
            const addr = value.addr
            const file: string = value.file
            const filePath: string = file.replace('.', dir)
            for (const p in partList) {
              // eslint-disable-next-line max-depth
              if (partList[p] === key) {
                // eslint-disable-next-line no-console
                params.push(addr)
                params.push(filePath)

                binList.push(`${key}(${addr})`)
              }
            }
          }
        }
        // eslint-disable-next-line no-console
        ctx.params = params
        ctx.binList = binList
      } else {
        throw new Error('读取manifest.json文件失败')
      }
    },
  })
}
