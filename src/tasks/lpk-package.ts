import {job, fs} from '@listenai/lisa_core'
// import * as path from 'path'
import Utils from '../lib/utils'
import {existsSync, readFileSync} from 'fs'
import * as path from 'path'
import defaultPath from '../util/default-path'
interface Args {
  manifest?: string;
}

interface Manifest {
  version?: string;
  name?: string;
  build_date?: number;
  chip_model?: string;
  burner?: string;
  images: {
    flashboot?: Image;
    master?: Image;
    script?: Image;
    respak?: Image;
  };
}

interface Image {
  addr: string;
  file: string;
}

module.exports = () => {
  job('lpk:package', {
    title: '打包 LPK 固件包',
    task: async ctx => {
      ctx.application = Utils.getGlobal('application')
      ctx.fs = Utils.getGlobal('fs')
      // ctx.application.log(JSON.stringify(ctx.application.argv))
      const args: Args = ctx.application.argv
      // manifest.json绝对路径
      const manifestPath = args.manifest
      // 获取目录绝对路径
      const parsed = path.parse(manifestPath)
      // 获取根目录路径
      const dir = parsed.dir
      const imagePath = path.join(dir, '/images')
      const zip = fs.project.zip()

      if (!existsSync(imagePath)) {
        throw new Error(`无法找到 ${imagePath} 文件夹`)
      }
      // zip.addLocalFolder(imagePath, 'images')
      // eslint-disable-next-line no-console
      // console.log(`LPK参数- dir: ${dir} | json: ${manifestPath}`)

      if (manifestPath) {
        const manifestConfig: Manifest = JSON.parse(readFileSync(manifestPath).toString())
        if (existsSync(manifestPath)) {
          // 为zip manifest.json
          zip.addLocalFile(manifestPath)
          const imgPath: string = manifestConfig.burner.replace('.', dir)
          if (!existsSync(imgPath)) {
            throw new Error(`无法找到 ${imgPath} 文件夹`)
          }
          // 为zip .img
          zip.addLocalFile(imgPath)
          if (manifestConfig.images) {
            Object.keys(manifestConfig.images).forEach(key => {
              const image: Image = manifestConfig.images[key]
              if (!image.addr) {
                throw new Error(`image ${key} 未配置地址 addr`)
              } else if (image.addr.match(/0(x(\d|[a-f]|[A-F])+)?/g)[0] !== image.addr) {
                throw new Error(`image ${key} 地址配置不合法 —— ${image.addr}`)
              } else if (!image.file) {
                throw new Error(`image ${key} 未配置 bin 文件 file`)
              }

              const filePath: string = image.file.replace('.', dir)
              if (!existsSync(filePath)) {
                throw new Error(`image ${key} 镜像文件 ${image.file} 不存在`)
              }
              // 为zip添加本地文件
              zip.addLocalFile(filePath, 'images')
            })
            // 生成zip文件
            const zipPath = path.join(defaultPath.targetPath(), '/output/debug/burner.lpk')
            // eslint-disable-next-line no-console
            console.log(`生成zip:${zipPath}`)
            zip.writeZip(zipPath)
          } else {
            throw new Error(`${args.manifest} 未配置正确的 images 参数`)
          }
        } else {
          throw new Error(`${args.manifest} 文件不存在！`)
        }
      } else {
        throw new Error('请先配置一个 manifest.json 文件。例如: lisa task lpk:package --manifest ./manifest.json')
      }
    },
  })
}
