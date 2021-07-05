const request = require('request')
import {application} from '@listenai/lisa_core'
import * as fs from 'fs'
import * as path from 'path'
import tomlHandler from '../util/toml-handler'

const Utils = {

  async downloadFile(uri: string, fileName: string, op: object) {
    if (fs.existsSync(fileName + '.loading')) {
      fs.unlinkSync(fileName + '.loading')
    }

    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName)
    }

    const res = await new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(fileName + '.loading')
      let successed = false
      const reader = request.get(uri, op, function (error: any, response: any) {
        if (!error && response.statusCode === 200) {
          successed = true
        } else {
          reject(new Error('下载出错'))
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
  },
  requireNoCache(url: string) {
    delete require.cache[require.resolve(url)]
    return require(url)
  },
  async sleep(time: number) {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(0)
      }, time)
    })
  },

  typeOf(obj: object) {
    return Object.prototype.toString.call(obj).replace(/\[object|\s|\]/g, '')
  },

  deepToObj(arr: any, val: any) {
    const self: any = this
    const obj = {[arr[arr.length - 1]]: val}
    arr.pop()
    if (arr.length !== 0) {
      return self.deepToObj(arr, obj)
    }
    return obj
  },
  addSpace(newVal: string, spaceNum: number) {
    return newVal
    .split('\n')
    .map((item, index) => {
      if (index) {
        let space = ''
        if (spaceNum) {
          for (let i = 1; i < spaceNum; i++) {
            space += '  '
          }
        }
        return `${space}${item}`
      }
      return item
    })
    .join('\n')
  },
  deepReplace(tomlStr: string, obj: any, keyRoad = '') {
    let keys = []
    keys = Object.keys(obj)
    const self = this
    keys.forEach(key => {
      if (self.typeOf(obj[key]) !== 'Object') {
        if (self.typeOf(obj[key]) === 'Array') {
          const newKey = `${keyRoad}${key}`
          if (newKey === 'peripheral.gpio') {
            obj[key].forEach((item: any) => {
              tomlStr = self.deepReplace(tomlStr, item, `${keyRoad}${key}.${item.tag}.`)
            })
          } else {
            const newKeyArr = newKey.split('.')
            let newVal = ''
            if (obj[key].every((item: any) => self.typeOf(item) !== 'Object' && self.typeOf(item) !== 'Array')) {
              newVal = JSON.stringify(obj[key])
            } else {
              const newObj = self.deepToObj(JSON.parse(JSON.stringify(newKeyArr)), obj[key])
              newVal = tomlHandler.stringify(newObj)
              const spaceNum = newKeyArr.length
              newVal = newVal.split('\n').map((item, index) => {
                if (index) {
                  let space = ''
                  if (spaceNum) {
                    for (let i = 1; i < spaceNum; i++) {
                      space += '  '
                    }
                  }
                  return `${space}${item}`
                }
                return item
              }).join('\n')
            }
            tomlStr = tomlStr.replace(`【${newKey}】`, newVal)
          }
        } else {
          tomlStr = tomlStr.replace(`【${keyRoad}${key}】`, obj[key])
        }
      } else {
        const newKey = `${keyRoad}${key}`
        if (['factory_gpio.check_enter', 'business.cv'].includes(newKey)) {
          const newKeyArr = newKey.split('.')
          const newObj = self.deepToObj(JSON.parse(JSON.stringify(newKeyArr)), obj[key])
          let newVal = tomlHandler.stringify(newObj)
          newVal = self.addSpace(newVal, newKeyArr.length)
          tomlStr = tomlStr.replace(`【${newKey}】`, newVal)
        } else {
          tomlStr = self.deepReplace(tomlStr, obj[key], `${keyRoad}${key}.`)
        }
      }
    })
    return tomlStr
  },
  getPlatformEncoding() {
    return process.platform === 'win32' ? 'gbk' : 'utf-8'
  },
  getTodayDate() {
    const time = new Date()
    const year = time.getFullYear()
    const month =
      time.getMonth() + 1 >= 10 ?
        time.getMonth() + 1 :
        '0' + (time.getMonth() + 1)
    const date = time.getDate() >= 10 ? time.getDate() : '0' + time.getDate()
    return `${year}${month}${date}`
  },
  newPconfig(confPath?: string, self?: any) {
    const cskProject = path.join(
      process.cwd(),
      'project.csk'
    )
    if (!fs.existsSync(cskProject)) {
      return false
    }
    if (confPath) {
      // 重新打包
      const config = tomlHandler.load(confPath)
      return config
    }
    // 新项目打包
    let targetUri: any

    const newTargetUri = path.join(
      process.cwd(),
      'config'
    )
    if (fs.existsSync(newTargetUri)) {
      targetUri = newTargetUri
    }

    const children = fs.readdirSync(targetUri)
    let error = false;
    ['base.csk', 'tones.csk'].forEach(fileName => {
      if (children.indexOf(fileName) < 0) {
        self.log(`该csk项目缺少${fileName}文件`)
        error = true
      }
    })
    if (error) {
      return false
    }

    let config = tomlHandler.load(path.join(cskProject)).package || {}
    const baseConfig = tomlHandler.load(path.join(targetUri, 'base.csk'))
    config = Object.assign(config, baseConfig)

    const tonesConfig: any = tomlHandler.load(path.join(targetUri, 'tones.csk'))
    let maxTtsId = tonesConfig.tts && tonesConfig.tts.length > 0 ?
      tonesConfig.tts.reduce((p: any, v: any) => (p.id < v.id ? v : p)).id :
      0

    let interactConfig: any = {
      template: '',
      interact: [],
    }
    if (fs.existsSync(path.join(targetUri, 'interact.csk'))) {
      interactConfig = tomlHandler.load(path.join(targetUri, 'interact.csk'))
    }
    const welcome: any = []
    const cmds: any = []
    const wakeup: any = []
    const entityTts: any = [];
    (interactConfig.interact || []).forEach((item: any) => {
      switch (item.action) {
      case 'welcome':
        if (item.play && item.play !== 1001) {
          welcome.push(parseInt(item.play, 10))
        }
        break
      case 'cmd':
        if (item.text) {
          if (item.play && item.play === 1001) {
            maxTtsId += 1
            entityTts.push({
              id: maxTtsId,
              text: `将为您${item.text}`,
            })
            item.play = maxTtsId
          }
          cmds.push(item)
        }
        break
      case 'wakeup':
        if (item.text) {
          if (item.play && item.play === 1001) {
            maxTtsId += 1
            entityTts.push({
              id: maxTtsId,
              text: `将为您${item.text}`,
            })
            item.play = maxTtsId
          }
          wakeup.push(item)
        }
        break

      default:
        break
      }
    })
    config = Object.assign(config, {
      template: interactConfig.template,
      welcome,
      cmds,
      wakeup,
    })

    tonesConfig.tts = [...tonesConfig.tts, ...entityTts]
    config = Object.assign(config, {tones: tonesConfig})

    return config
  },

  setGlobal(key: string, val: any) {
    (global as any)[key] = val
  },

  getGlobal(key: string) {
    if (key === 'application') {
      return (global as any)[key] || application
    }
    return (global as any)[key]
  },

  getPipelineTask(key: string) {
    return (global as any).application.pipeline[key].tasks.join(',')
  },
}

export default Utils
