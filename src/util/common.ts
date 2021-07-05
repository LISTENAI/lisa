import * as fs from 'fs'
import * as path from 'path'
import DefaultPath from '../util/default-path'

const common = {
  totalCmd(pconfig: any) {
    const cmds = (pconfig.cmds || []).map((cmd: any, index: any) => {
      return {
        id: index + 1,
        text: cmd.text,
        pinyin: cmd.pinyin,
        play: cmd.play,
        cmds: cmd.cmds,
      }
    })
    return cmds
  },

  totalAwake(pconfig: any) {
    const awakes = (pconfig.wakeup || []).map((wakeup: any, index: any) => {
      return {
        id: index + 501,
        text: wakeup.text,
        pinyin: wakeup.pinyin,
        play: wakeup.play,
        cmds: wakeup.cmds,
      }
    })
    return awakes
  },

  handleBaseWordsThreshold: async (fileName: string, basePackPath: string) => {
    const baseTxtArr = []
    let wordsThreshold = []
    const wordsThresholdStr = fs.readFileSync(path.join(basePackPath, `${fileName}.txt`)).toString()
    wordsThreshold = wordsThresholdStr.split('\r').join('').split('\n').filter(val => val !== '')
    const sameConfig = false
    const lastWordsThreshold: any = []

    let change = false

    for (let i = 0; i <= wordsThreshold.length - 1; i++) {
      const tmp = wordsThreshold[i].split(',')
      //   tmp[1] = parseInt(tmp[1] / 2);
      //   tmp[1] = parseInt(tmp[1]);
      if (sameConfig) {
        for (let j = 0; j <= lastWordsThreshold.length - 1; j++) {
          const oldTmp = lastWordsThreshold[j].split(',')
          if (oldTmp[4] === tmp[4]) {
            if (tmp[1] !== oldTmp[1] || tmp[2] !== oldTmp[2]) {
              tmp[1] = parseInt(oldTmp[1], 10) > 0 ? oldTmp[1] : tmp[1]
              tmp[2] = oldTmp[2]
              change = true
            }
            break
          }
        }
      }
      baseTxtArr.push(tmp)
    }
    const baseTxt = baseTxtArr.map(item => item.join(',')).join(';')
    fs.writeFileSync(path.join(basePackPath, `${fileName}.txt`), baseTxt.replace(/;/g, '\n'))
    fs.writeFileSync(path.join(basePackPath, `${fileName}_finaly.txt`), baseTxt.replace(/;/g, '\n'))
    return change
  },

  handleTemplateWordsThreshold: async (basePackPath: string) => {
    if (!fs.existsSync(path.join(basePackPath, 'templateCmd.txt'))) {
      return
    }

    const baseTxtArr = []
    let wordsThreshold = []
    const wordsThresholdStr = fs.readFileSync(path.join(basePackPath, 'cmd.txt')).toString()
    wordsThreshold = wordsThresholdStr.split('\r').join('').split('\n').filter(val => val !== '')
    let lastWordsThreshold = []

    const lastWordsThresholdStr = fs.readFileSync(path.join(basePackPath, 'templateCmd.txt')).toString()
    lastWordsThreshold = lastWordsThresholdStr.split('\r').join('').split('\n').filter(val => val !== '')

    let change = false

    for (let i = 0; i <= wordsThreshold.length - 1; i++) {
      const tmp = wordsThreshold[i].split(',')
      for (let j = 0; j <= lastWordsThreshold.length - 1; j++) {
        const oldTmp = lastWordsThreshold[j].split(',')
        if (oldTmp[4] === tmp[4]) {
          if (tmp[1] !== oldTmp[1] || tmp[2] !== oldTmp[2]) {
            tmp[1] = parseInt(oldTmp[1], 10) > 0 ? oldTmp[1] : tmp[1]
            tmp[2] = oldTmp[2]
            change = true
          }
          break
        }
      }
      baseTxtArr.push(tmp)
    }
    const baseTxt = baseTxtArr.map(item => item.join(',')).join(';')
    fs.writeFileSync(path.join(basePackPath, 'cmd.txt'), baseTxt.replace(/;/g, '\n'))
    fs.writeFileSync(path.join(basePackPath, 'cmd_finaly.txt'), baseTxt.replace(/;/g, '\n'))
    return change
  },
  handleWordsThreshold: async (fileName: string, basePackPath: string) => {
    if (!fs.existsSync(DefaultPath.thresholdsPath(`${fileName}_finaly.txt`))) {
      return
    }

    const baseTxtArr = []
    let wordsThreshold = []
    const wordsThresholdStr = fs.readFileSync(path.join(basePackPath, `${fileName}_finaly.txt`)).toString()
    wordsThreshold = wordsThresholdStr.split('\r').join('').split('\n').filter(val => val !== '')
    let lastWordsThreshold = []

    const lastWordsThresholdStr = fs.readFileSync(DefaultPath.thresholdsPath(`${fileName}_finaly.txt`)).toString()
    lastWordsThreshold = lastWordsThresholdStr.split('\r').join('').split('\n').filter(val => val !== '')

    let change = false

    for (let i = 0; i <= wordsThreshold.length - 1; i++) {
      const tmp = wordsThreshold[i].split(',')
      for (let j = 0; j <= lastWordsThreshold.length - 1; j++) {
        const oldTmp = lastWordsThreshold[j].split(',')
        if (oldTmp[4] === tmp[4]) {
          if (tmp[1] !== oldTmp[1] || tmp[2] !== oldTmp[2]) {
            tmp[1] = parseInt(oldTmp[1], 10) > 0 ? oldTmp[1] : tmp[1]
            tmp[2] = oldTmp[2]
            change = true
          }
          break
        }
      }
      baseTxtArr.push(tmp)
    }
    const baseTxt = baseTxtArr.map(item => item.join(',')).join(';')
    fs.writeFileSync(path.join(basePackPath, `${fileName}_finaly.txt`), baseTxt.replace(/;/g, '\n'))
    return change
  },
  latestSucceedBuilderPath: () => {
    const files = fs.readdirSync(DefaultPath.newBuildPath(), {withFileTypes: true})
    const dirs: any = [];
    (files || []).forEach(file => {
      if (file.isDirectory() && file.name.endsWith('_csk') && !file.name.endsWith('_failed_csk') && !file.name.endsWith('_cancel_csk') && file.name.split('-').length === 3) {
        dirs.push(file.name)
      }
    })
    dirs.sort(function (val1: string, val2: string) {
      return parseInt(val2.replace(/[-._]/g, ''), 10) - parseInt(val1.replace(/[-._]/g, ''), 10)
    })
    if (dirs.length > 0) {
      return DefaultPath.newBuildPath(dirs[0])
    }
    return null
  },

}
export default common
