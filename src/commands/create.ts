/* eslint-disable node/no-unsupported-features/node-builtins */
import { Command, flags } from '@oclif/command'
import lisa from '@listenai/lisa_core'
import { loadTaskDict } from '@listenai/lisa_core'
import * as path from 'path'
import lpminit from '../util/lpminit'
import * as Configstore from 'configstore'

export default class Create extends Command {
  static description = '创建项目，例`lisa create newProject -t @generator/csk`';

  static args = [
    {
      name: 'name',
      required: false,
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

  async getProjectName() {
    const { args } = this.parse(Create)
    const { cli } = lisa
    // let projectName = ''
    // while (!projectName.match(/^[_a-zA-Z0-9-]{1,}$/)) {
    // if (projectName) {
    //   this.log('工程名称仅支持英文、数字、下划线、-')
    // }
    // eslint-disable-next-line no-await-in-loop
    const projectName = args.name || await cli.prompt('请输入工程名称', {
      default: '.',
    })
    // }
    return projectName
  }

  async getGenerator() {
    const { flags } = this.parse(Create)
    const generator = flags.template || ''
    return generator
  }

  async run() {
    // this.log('启动创建...')
    const DEBUG = process.env.LISA_ENV === 'debug'
    const { args, flags } = this.parse(Create)
    const { fs, application, cmd, job, runner } = lisa
    const config = new Configstore('lisa')
    const lisaUserInfo = config.get('userInfo') || {}
    if (!lisaUserInfo?.username) {
      throw new Error('请先登录，执行`lisa login`')
    }
    job('lisa:create', {
      title: '启动创建...',
      task: async (ctx, task) => {
        await lpminit()
        const projectName = ctx.projectName || await task.prompt({
          type: 'input',
          name: 'value',
          message: '请输入工程名称',
          initial: '.',
        })
        ctx.projectName = projectName
        const generator = ctx.generator || await (async () => {
          const command = `search generator --long --json --registry=${application.registryUrl}`
          const { stdout } = await cmd('npm', command.split(' '))
          let generators = JSON.parse(stdout)
          if (!DEBUG) {
            generators = generators.filter(item => !['@generator/board', '@generator/lpm-pkg'].includes(item.name))
          }
          const generator = await task.prompt({
            type: 'select',
            name: 'value',
            message: '请选择工程创建类型',
            choices: ['init'].concat(generators.map(item => item.name)),
          })
          return generator
        })()
        ctx.generator = generator === 'init' ? '' : generator
      },
    })

    // eslint-disable-next-line prefer-const
    let { projectName, generator } = (await runner('lisa:create', {
      projectName: args.name,
      generator: flags.template,
    }) as {
      projectName: string;
      generator: string;
    })

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
    } else {
      projectName = path.basename(fs.project.root)
    }

    // 当没有generate时,创建空白项目
    fs.mkdirpSync(fs.project.root)
    process.chdir(fs.project.root)
    fs.project.template_path = path.join(__dirname, '../../public/newProject')
    await fs.project.template('package.json.ejs', 'package.json', {
      projectName: projectName,
    })
    application.gitignore(path.join(fs.project.root, './.gitignore'), ['node_modules'])

    try {
      this.debug('yarn', ['add', '@listenai/lisa_core', `${generator ? DEBUG ? `${generator}@beta` : generator : ''}`, `--registry=${application.registryUrl}`].join(' '))
      await cmd('yarn', ['add', '@listenai/lisa_core', `${generator ? DEBUG ? `${generator}@beta` : generator : ''}`, `--registry=${application.registryUrl}`], {
        cwd: fs.project.root,
        shell: true,
        stdio: 'inherit',
      })
    } catch (error) {
      this.log(error.message)
      this.error('执行命令错误，请重新登录再执行或联系fae进行排查')
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
      await loadTaskDict()

      if (process.env.ListenAiCachePath || (process.env.VSCODE_GIT_ASKPASS_NODE && process.env.VSCODE_GIT_ASKPASS_NODE.indexOf('LStudio.exe') >= 0)) {
        await cmd('lstudio', ['.'], {
          cwd: fs.project.root,
          shell: true,
          stdio: 'inherit',
        })
      } else if ((process.env.VSCODE_GIT_ASKPASS_NODE && process.env.VSCODE_GIT_ASKPASS_NODE.indexOf('Code.exe'))) {
        await cmd('code', ['.'], {
          cwd: fs.project.root,
          shell: true,
          stdio: 'inherit',
        })
      } else {
        const Path = process.env?.Path || process.env?.PATH || process.env?.path
        if (Path.indexOf('VS Code') >= 0) {
          await cmd('code', ['.'], {
            cwd: fs.project.root,
            shell: true,
            stdio: 'inherit',
          })
        }
      }
    } catch (error) {
      this.error(error.message)
    }
  }
}
