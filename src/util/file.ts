import * as fs from 'fs'
import * as path from 'path'

const File = {
  // 删除所有的空文件夹
  deleteFile: (filePath: string) => {
    if (fs.existsSync(filePath)) {
      const files = fs.readdirSync(filePath)
      files.forEach(function (file) {
        const curPath = path.join(filePath, file)
        if (fs.statSync(curPath).isDirectory()) {
          // recurse
          File.deleteFile(curPath)
        } else {
          // delete file
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(filePath)
    }
  },

  deleteFolder: (path: string) => {
    let files = []
    if (fs.existsSync(path)) {
      if (fs.statSync(path).isDirectory()) {
        files = fs.readdirSync(path)
        files.forEach(function (file) {
          const curPath = path + '/' + file
          if (fs.statSync(curPath).isDirectory()) {
            File.deleteFolder(curPath)
          } else {
            fs.unlinkSync(curPath)
          }
        })
        fs.rmdirSync(path)
      } else {
        fs.unlinkSync(path)
      }
    }
  },

  copyFolder: (from: string, to: string) => {
    // 复制文件夹到指定目录
    // const self: any = this
    let files = []
    if (fs.existsSync(to)) {
      // 文件是否存在 如果不存在则创建
      files = fs.readdirSync(from)
      files.forEach(function (file) {
        const targetPath = from + '/' + file
        const toPath = to + '/' + file
        if (fs.statSync(targetPath).isDirectory()) {
          // 复制文件夹
          File.copyFolder(targetPath, toPath)
        } else {
          // 拷贝文件
          fs.copyFileSync(targetPath, toPath)
        }
      })
    } else {
      fs.mkdirSync(to)
      File.copyFolder(from, to)
    }
  },

}
export default  File
