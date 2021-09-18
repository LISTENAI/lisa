import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import lpminit from '../util/lpminit'
import * as path from 'path'
import * as inquirer from 'inquirer'
import * as Configstore from 'configstore'

export default class Tools extends Command {
  static description = '终端工具'

  static args = [
    {
      name: 'publish',
      required: false,
      description: '启动发布流程',
    },
  ]

  static strict = false

  async run() {
    const {application, cmd, cli, fs} = lisa
    const {args} = this.parse(Tools)
    const config = new Configstore('lisa')
    const lisaUserInfo = config.get('userInfo')
    // 发布
    if (args.publish) {
      // 1、获取lpm包名
      let cliName = await cli.prompt('请输入要发布的包名。(无需包含前缀@cli-tool/)')
      const name = `@cli-tool/${cliName}`
      this.log(`正在启动'${name}'的发布流程...`)
      await lpminit()

      // 2、获取该包的lpm信息
      let info: {
        version?: string;
        maintainers?: string;
        description?: string;
        bin?: object;
        author?: string;
      } = {}
      try {
        this.debug(`npm ${['view', name, 'version', 'maintainers', '--json', `--registry=${application.registryUrl}`].join(' ')}`)
        const res = await cmd('npm', ['view', name, 'version', 'maintainers', 'description', 'bin', 'author', '--json', `--registry=${application.registryUrl}`])
        info = JSON.parse(res.stdout)
      } catch (error) {
        if (JSON.parse(error.stdout).error.code.endsWith('404')) {
          this.debug('这个包不存在噢')
        } else {
          this.debug(error)
          this.error(error.message || '未知错误，请重新执行命令并带上 --debug 参数排查')
        }
      }
      this.debug(info)

      // 3、判断是否新包
      let versionCli: any
      if (info?.version && info?.maintainers) {
        if (!(info.maintainers || []).includes(`${lisaUserInfo.username} <${lisaUserInfo.email}>`)) {
          this.error(`当前登录账号无权限发布${name}`)
        }
        versionCli = await inquirer.prompt({
          name: 'value',
          message: `该包版本为${info.version}，此次发布版本号需要：`,
          type: 'list',
          choices: ['major 重大变更', 'minor 较小变更', 'patch 补丁'],
        })
        this.debug(versionCli.value)
        versionCli = versionCli.value.split(' ')[0]
        this.debug(versionCli)
      } else {
        const newPublish = await cli.confirm(`未找到'${name}'的发布信息，是否新建发布?(y/n)`)
        this.debug(newPublish)
        if (!newPublish) {
          return
        }
      }

      // 4、工具包的基本信息
      cliName = await cli.prompt('cli启动命令为', {
        default: Object.keys(info?.bin || {})[0] || cliName,
      })

      const description = await cli.prompt('简单一句话描述你的工具包', {
        default: info?.description || '',
        required: true,
      })

      const author = await cli.prompt('作者', {
        default: info?.author || `${lisaUserInfo.username} <${lisaUserInfo.email}>`,
        required: true,
      })

      // 5、本地创建该包目录
      {
        const publishDir = path.join(this.config.cacheDir, 'publishDir')
        await fs.remove(publishDir)
        await fs.mkdirp(publishDir)
        fs.project.root = publishDir
        fs.project.template_path = path.join(__dirname, '../../public/publishProject')

        await fs.project.template('package.json.ejs', 'package.json', {
          projectName: name,
          version: info?.version || '1.0.0',
          cliName: cliName,
          description: description,
          author: author,
        })

        await fs.project.copy('bin', 'bin')

        await fs.project.template('bin/run', 'bin/run', {
          cliName: cliName,
        })
      }
      const nativeDialog = require('native-file-dialog')
      {
        cli.action.start('选择windows下可执行文件...')
        await cli.wait(1000)
        let winTar = ''
        let cancel = 0
        while (!fs.existsSync(winTar) && cancel < 3) {
          winTar = nativeDialog.file_dialog()
          if (winTar === '') {
            cancel++
          }
          this.debug(winTar)
        }
        cli.action.stop()
        await fs.project.mkdir('lib')
        fs.copyFileSync(winTar, path.resolve(path.join(fs.project.root, `lib/${cliName}-win32.exe`)))
      }
      {
        cli.action.start('选择readme.md文件...')
        await cli.wait(1000)
        let readMe = ''
        while (!fs.existsSync(readMe)) {
          readMe = nativeDialog.file_dialog()
          this.debug(readMe)
        }
        cli.action.stop()
        fs.copyFileSync(readMe, path.resolve(path.join(fs.project.root, 'README.md')))
      }

      this.log(`即将发布 ${name} ，版本号为：`)
      if (versionCli) {
        // 若为更新包，处理版本号
        this.debug(`npm ${['version', versionCli].join(' ')}`)
        await cmd('npm', ['version', versionCli], {
          cwd: fs.project.root,
          stdio: 'inherit',
        })
      } else {
        this.log('v1.0.0')
      }

      await cli.wait(3000)

      // 6、发布
      this.debug(`npm ${['publish', `--registry=${application.registryUrl}`].join(' ')}`)
      // await cmd('npm', ['publish', `--registry=${application.registryUrl}`], {
      //   cwd: fs.project.root,
      //   stdio: 'inherit',
      // })
      return
    }
    // npm list -g --json --depth 0
    try {
      this.debug(`npm ${['list', '-g', '--json', '--depth', '0'].join(' ')}`)
      const res = await cmd('npm', ['list', '-g', '--json', '--depth', '0'])
      const dependencies = JSON.parse(res.stdout).dependencies
      const packages = Array.prototype.filter.call(Object.keys(dependencies) || [], item => item.startsWith('@cli-tool/'))
      const tableData = packages.map(item => {
        return {
          name: item,
          version: dependencies[item].version,
        }
      })
      this.debug(tableData)

      cli.table(tableData, {
        name: {
          header: 'Name',
        },
        version: {
          header: 'Version',
        },
      })
    } catch (error) {
      this.error(error.message)
    }
  }
}
