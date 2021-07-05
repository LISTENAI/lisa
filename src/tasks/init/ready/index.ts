import {job, fs, application} from '@listenai/lisa_core'
import * as path from 'path'

module.exports = () => {
  job('init:ready', {
    title: '文件初始化',
    task: async () => {
      const projectNamePattern = /^[_a-zA-Z0-9-]+$/
      if (!projectNamePattern.test(path.basename(path.resolve()))) {
        throw new Error('项目名称不能包含中文、空格或特殊符号')
      }

      fs.project.template_path = path.join(__dirname, '../../../../public/newProject')

      await fs.project.template('task.js.ejs', 'task.js', {
        name: path.basename(path.resolve()),
      })
      await fs.project.template('config.js.ejs', 'config.js', {
        name: path.basename(path.resolve()),
      })

      await fs.project.template('package.json.ejs', 'package.json', {
        projectName: path.basename(path.resolve()),
      })

      application.gitignore('./.gitignore', ['node_modules', '.DS_Store', '.lisa'])
    },
  })
}
