import {Command} from '@oclif/command'
import lisa from '@listenai/lisa_core'
import {loadTaskDict} from '@listenai/lisa_core'
import lpminit from '../util/lpminit'
import { ParsedArgs } from 'minimist'
import * as path from 'path'

export default class Install extends Command {
  static description = '安装依赖'

  static args = [
    {
      name: 'pkg',
      required: false,
      description: "资源包名，例：'@source/csk4002'，不填时默认安装lisa项目中的依赖",
    },
  ]

  static strict = false

  async run() {
    const {application, cli, exec, fs} = lisa
    const {argv} = this.parse(Install)
    const hasRegistry = argv.some(item => item.startsWith('--registry='))
    const globalInstall = argv.some(item => item === '-g' || item === '--global')
    const hasPkg = argv.some(item => !item.startsWith('-'))

    const applicationArgv = application.argv as ParsedArgs
    const noSave = applicationArgv?.save === false
    const noLock = applicationArgv['package-lock'] === 'false'
    const logLevel = applicationArgv?.loglevel

    this.debug('noSave', noSave)
    this.debug('noLock', noLock)
    this.debug('logLevel', logLevel)
    const command = (globalInstall ? ['install'] : hasPkg ? ['add'] : []).concat(argv)


    if (!hasRegistry) {
      command.push(`--registry=${application.registryUrl}`)
      await lpminit()
    }

    let packageJSON = ''
    if (noSave) {
      packageJSON = fs.readFileSync(path.join(process.cwd(), 'package.json')).toString()
    }

    try {
      this.debug(globalInstall ? 'npm' : 'yarn', command.join(' '))
      if (!logLevel) {
        cli.action.start('安装依赖', '正在安装', {stdout: true})
      }
      const code = await exec(globalInstall ? 'npm' : 'yarn', command, undefined, line => {
        if (!logLevel) {
          this.debug(line)
        } else {
          this.log(line)
        }
      })
      this.debug(code)
      if (code === 0 && !noSave && !noLock) {
        await loadTaskDict()
      }
      if (!logLevel) {
        cli.action.stop(code === 0 ? '成功' : '失败')
      }
      if (noSave) {
        fs.writeFileSync(path.join(process.cwd(), 'package.json'), packageJSON)
      }
      if (noLock) {
        await fs.remove(path.join(process.cwd(), 'package-lock.json'))
        await fs.remove(path.join(process.cwd(), 'yarn.lock'))
      }
    } catch (error) {
      cli.action.stop('失败')
      this.error(error.message)
    }
  }
}
