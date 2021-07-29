/* eslint-disable node/no-unsupported-features/node-builtins */
import {Command, flags} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import * as path from 'path'

export default class Create extends Command {
  static description = '创建项目，例`lisa create newProject -t @generator/csk`';

  static args = [
    {
      name: 'name',
      required: true,
      description: '项目名称',
    },
  ];

  static flags = {
    template: flags.string({
      char: 't',
      description: '生成器模板',
      required: false,
    }),
  };

  async run() {
    const DEBUG = process.env.LISA_ENV === 'debug'

    const {fs, application, cmd} = lisa
    const {args, flags} = this.parse(Create)
    const projectName = args.name

    const generator = flags.template || ''

    this.debug('projectName:', projectName)
    this.debug('generator:', generator)

    if (projectName !== '.') {
      const projectNamePattern = /^[_a-zA-Z0-9-]+$/
      if (!projectNamePattern.test(projectName)) {
        this.error('项目名称只能使用数字、英文字母、下划线')
      }
      fs.project.root = fs.project.join(projectName)
      if (fs.existsSync(fs.project.root)) {
        this.error('该目录下已存在相同名称的文件夹')
      }
    }

    // 当没有generate时,创建空白项目
    fs.mkdirpSync(fs.project.root)
    fs.project.template_path = path.join(__dirname, '../../public/newProject')
    await fs.project.template('package.json.ejs', 'package.json', {
      projectName: projectName,
    })
    application.gitignore(path.join(fs.project.root, './.gitignore'), ['node_modules'])

    try {
      await cmd('yarn', ['add', `@listenai/lisa_core${DEBUG ? '@beta' : ''}`, `${generator ? DEBUG ? `${generator}@beta` : generator : ''}`, `--registry=${application.registryUrl}`], {
        cwd: fs.project.root,
        shell: true,
        stdio: 'inherit',
      })
    } catch (error) {
      this.error(error.message)
    }

    if (!generator) {
      fs.project.copy('task.js', 'task.js')
      return this.log(`创建成功: ${fs.project.root}`)
    }

    const execStr = [
      `require('${generator}').default();`,
    ]
    try {
      await cmd('node', ['-e', `"${execStr.join('')}"`], {
        cwd: fs.project.root,
        shell: true,
        stdio: 'inherit',
      })
      await cmd('lstudio', ['.'], {
        cwd: fs.project.root,
        shell: true,
        stdio: 'inherit',
      })
    } catch (error) {
      this.error(error.message)
    }
  }
}
