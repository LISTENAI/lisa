import * as fs from 'fs'
import * as request from 'request'

export default async (uri: any, fileName: fs.PathLike, op?: any) => {
  if (fs.existsSync(fileName + '.loading')) {
    fs.unlinkSync(fileName + '.loading')
  }
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName)
  }
  const res = await new Promise((resolve, _reject) => {
    const stream = fs.createWriteStream(fileName + '.loading')
    let successed = false
    const reader = request.get(uri, op, function (error, response, _data) {
      if (!error && response.statusCode === 200) {
        successed = true
      }
    })
    const pipe = reader.pipe(stream)
    const timeout = setTimeout(function () {
      stream.end()
    }, 50000)
    pipe.on('close', function () {
      if (timeout) {
        clearTimeout(timeout)
      }
      resolve(successed)
    })
    pipe.on('error', function () {
      resolve(successed)
    })
  })
  if (res) {
    fs.renameSync(fileName + '.loading', fileName)
  }
  return res
}
