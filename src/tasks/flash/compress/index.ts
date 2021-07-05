import {job, fs} from '@listenai/lisa_core'
import Utils from '../../../lib/utils'
import * as path from 'path'

module.exports = () => {
  job('flash:compress', {
    title: '解压LPK文件',
    task: async ctx => {
      ctx.application = Utils.getGlobal('application')
      const {cskburn} = ctx.application.context
      await fs.project.unzip(cskburn.fp, path.dirname(cskburn.fp))
    },
  })
}
