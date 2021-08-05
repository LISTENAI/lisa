import lisa from '@listenai/lisa_core'
const {CSKBURN} = require('@listenai/cskburn')
import * as iconv from 'iconv-lite'
export default class FlashCommand {
  excuteCommand(params: Array<string>, binList: Array<string>) {
    const {cmd, application, cli} = lisa
    // eslint-disable-next-line no-console
    console.log(`bin list > ${binList}`)
    // eslint-disable-next-line no-console
    console.log('[-]等待设备进入烧录模式...')
    const sleep = 100
    application.debug(`${CSKBURN} ${params.join(' ')}`)
    const cskburnExcute = cmd(CSKBURN, params)

    let partNum = 1
    let customBar = null
    // eslint-disable-next-line complexity
    cskburnExcute.stdout.on('data', async data => {
      await cli.wait(sleep)
      let logMsg = ''
      if (process.platform === 'win32') {
        logMsg = iconv.decode(data, 'gbk')
      } else {
        logMsg = data.toString()
      }
      // eslint-disable-next-line no-empty
      if (logMsg.indexOf('KB') !== -1 && logMsg.indexOf('正在烧录分区') === -1) {
        const valueMsg = logMsg.match(/\d+(\.\d+)?/g)[0]
        // this.log(`分区value：${valueMsg}`)
        const totalMsg = logMsg.match(/\d+(\.\d+)?/g)[1]
        // this.log(`分区总共：${totalMsg}`)
        if (valueMsg !== null && totalMsg !== null) {
          customBar.value = valueMsg
          customBar.total =  totalMsg
          if (valueMsg === totalMsg) {
            customBar.stop()
            partNum++
          }
        }
      } else if (logMsg.indexOf('正在烧录分区') !== -1) {
        const partName = binList[partNum - 1]
        customBar = cli.progress({
          format: `烧录分区 ${partNum}｜ {bar} | {value} KB/{total} KB | ${partName}`,
          barCompleteChar: '\u2588',
          barIncompleteChar: '\u2591',
        })
        customBar.start()

        if (logMsg.indexOf('KB') !== -1 && logMsg.indexOf('(100.00%)') !== -1 && customBar) {
          const length = logMsg.match(/\d+(\.\d+)?/g).length
          const valueMsg = logMsg.match(/\d+(\.\d+)?/g)[length - 3]
          const totalMsg = logMsg.match(/\d+(\.\d+)?/g)[length - 2]
          if (valueMsg !== null && totalMsg !== null) {
            customBar.value = valueMsg
            customBar.total =  totalMsg
            if (valueMsg === totalMsg) {
              customBar.stop()
              partNum++
            }
          }
        }
      } else if (logMsg.indexOf('错误') !== -1) {
        // eslint-disable-next-line no-console
        console.log(logMsg)
      } else if (logMsg.indexOf('烧录完成') !== -1) {
        // eslint-disable-next-line no-console
        console.log(logMsg)
      }
    })

    cskburnExcute.on('exit',  () => {
      // eslint-disable-next-line no-console
      // console.log(`code ${code} and signal ${signal}`)
      // excuteResolve()
    })
    // await excutePromise
  }
}
