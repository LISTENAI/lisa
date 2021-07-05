import {job, fs} from '@listenai/lisa_core'
import * as path from 'path'
import cookie from '../../../util/cookie'
import Utils from '../../../lib/utils'

module.exports = () => {
  job('create:init', {
    title: '项目创建准备',
    task: async ctx => {
      ctx.application = Utils.getGlobal('application')
      ctx.fs = Utils.getGlobal('fs')
      const context = ctx.application.context
      if (context.lisaCreate.projectName !== '.') {
        const pjPath = ctx.fs.project.root
        // await fs.remove(pjPath)
        if (fs.existsSync(pjPath)) {
          throw new Error('该目录下已经存在相同名称的项目，请更换项目名称或更换项目目录。')
        }
      }

      fs.project.template_path = path.join(__dirname, '../../../../public/newProject')

      await fs.project.template('package.json.ejs', 'package.json', context.lisaCreate)
      await fs.project.template('gitignore.ejs', '.gitignore', {ignore: [
        'node_modules',
      ].join('\n')})
    },
  })

  job('show:lisa_access_token', {
    title: '获取lisa_access_token',
    task: async () => {
      console.log(await cookie.get('ACCESS_TOKEN'))
    },
  })
}
