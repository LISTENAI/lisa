import {job, fs} from '@listenai/lisa_core'
import * as path from 'path'
import cookie from '../../util/cookie'

module.exports = () => {
  job('new:blank', {
    title: '创建空白项目',
    task: async ctx => {
      const context = ctx.application.context
      if (context.lisaNew.projectName) {
        const pjPath = fs.project.join(context.lisaNew.projectName)
        await fs.remove(pjPath)
        if (fs.existsSync(pjPath)) {
          throw new Error('该目录下已经存在相同名称的项目，请更换项目名称或更换项目目录。')
        }
        fs.project.root = pjPath
      }

      fs.project.template_path = path.join(__dirname, '../../../public/newProject')

      // await fs.project.copy('config.js', 'config.js')
      // await fs.project.copy('task.js', 'task.js')
      // await fs.project.template('project.csk.ejs', 'project.csk', {name: context.lisaNew.projectName})
      await fs.project.template('package.json.ejs', 'package.json', context.lisaNew)
      await fs.project.template('gitignore.ejs', '.gitignore', {ignore: [
        'node_modules',
      ].join('\n')})
      // await fs.project.template('npmignore.ejs', '.npmignore', {ignore: [
      //   'node_modules',
      // ].join('\n')})
    },
  })

  job('show:lisa_access_token', {
    title: '获取lisa_access_token',
    task: async () => {
      console.log(await cookie.get('ACCESS_TOKEN'))
    },
  })
}
