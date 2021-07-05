import cookie from '../util/cookie'
import {cmd, application, got} from '@listenai/lisa_core'
import Utils from '../lib/utils'
import * as shell from 'shelljs'
import * as iconv from 'iconv-lite'
import config from '../config'

const lmp = {
  getInfo: async () => {
    let _password
    let _username
    let _email
    const accessToken = process.env.LISA_ACCESS_TOKEN || Utils.getGlobal('application').lisaAccessToken || ''
    if (accessToken) {
      _password = accessToken
      const _apiHost = Utils.getGlobal('application').apiHost || application.apiHost
      const _apiPrefix = Utils.getGlobal('application').apiPrefix || application.apiPrefix
      const res = await got(`${_apiHost}${_apiPrefix}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'LStudio',
        },
      })
      const body = JSON.parse(res.body)
      if (body.recode === '000000') {
        _username = body.data.englishName
        _email = body.data.email
      } else {
        throw new Error('401 LISA_ACCESS_TOKEN 失效')
      }
    } else {
      _password = await cookie.get('ACCESS_TOKEN')
      _username = await cookie.get('ENG_NAME')
      _email = await cookie.get('EMAIL')
    }
    const _lpmRegistryUrl = Utils.getGlobal('application').lpmRegistryUrl || application.lpmRegistryUrl || '//registry-lpm.listenai.com'
    return {
      username: _username,
      password: _password,
      email: _email,
      lpmRegistryUrl: _lpmRegistryUrl,
    }
  },
  init: async () => {
    const npmInfo = config.get('lisaUserInfo')
    const buff = Buffer.from(npmInfo.password)

    // yarn config set registry
    await cmd('npm', ['set', `${config.get('lpmRegistryUrl')}/:username=${npmInfo.username}`])
    await cmd('npm', ['set', `${config.get('lpmRegistryUrl')}/:_password=${buff.toString('base64')}`])
    await cmd('npm', ['set', `${config.get('lpmRegistryUrl')}/:email=${npmInfo.email}`])
    await cmd('npm', ['set', `${config.get('lpmRegistryUrl')}/:always-auth=true`])
    return config.get('lpmRc')
  },

  login: async () => {
    const npmInfo = await lmp.getInfo()
    const username = npmInfo.username
    const password = npmInfo.password
    const email = npmInfo.email
    const registry = config.get('lpmRegistryUrl')

    const inputArray = [
      username + '\n',
      password + '\n',
      email + '\n',
    ]

    // console.log()

    const child = shell.exec(`npm login --registry=https:${registry}`, {async: true, silent: true})

    // child.stdin.write(username + '\n') // 这里输入密码
    // child.stdin.write('8adc71e9-960e-4a71-b8fc-25f3ab21178e\n') // 这里输入确认密码
    // child.stdin.write(email + '\n') // 这里输入确认密码

    child.stdout.on('data', () => {
      const cmd = inputArray.shift()
      if (cmd) {
        child.stdin.write(cmd)
      } else {
        child.stdin.end()
      }
    })
  },

  install: async (arg: Array<string>, global: boolean) => {
    const rc = await lmp.init()
    let cmdRc = [

    ]
    if (global) {
      cmdRc = [
        'install',
        '-g',
      ]
    }

    if (arg.length > 0) {
      cmdRc.push('add')
      cmdRc.push(...arg)
    }

    cmdRc.push(rc)

    let excuteResolve: any = null
    const excutePromise = new Promise((resolve, _reject) => {
      excuteResolve = resolve
    })
    application.log(`${global ? 'npm' : 'yarn'} ${cmdRc.join(' ')}`)
    const res = cmd(global ? 'npm' : 'yarn', cmdRc)
    res.stdout.on('data', data => {
      Utils.getGlobal('application').log(data.toString())
    })
    res.stderr.on('data', data => {
      Utils.getGlobal('application').errorLog(data.toString())
    })
    res.on('exit', code => {
      excuteResolve(!code)
    })

    const success = await excutePromise
    return success
  },
  upgrade: async (latest: boolean) => {
    const rc = await lmp.init()
    const yarnRc = [
      'upgrade',
    ]
    if (latest) {
      yarnRc.push('--latest')
    }
    yarnRc.push(rc)

    let excuteResolve: any = null
    const excutePromise = new Promise((resolve, _reject) => {
      excuteResolve = resolve
    })

    const res = cmd('yarn', yarnRc)
    res.stdout.on('data', data => {
      Utils.getGlobal('application').log(data.toString())
    })
    res.stderr.on('data', data => {
      Utils.getGlobal('application').errorLog(data.toString())
    })
    res.on('exit', code => {
      excuteResolve(!code)
    })

    const success = await excutePromise
    return success
  },
  search: async (arg: string) => {
    const rc = await lmp.init()
    const cmdArr = ['npm', 'search', arg, '--long', rc]
    return cmdArr
  },
  view: async (pkgName: string, versions: string) => {
    const rc = await lmp.init()
    const cmdArr = ['npm', 'view', pkgName, versions, rc]
    return cmdArr
  },
  publish: async (cli: any) => {
    await lmp.login()
    await cli.wait(3000)
    cli.action.stop('成功')
    await cmd('npm', ['publish'], {
      shell: true,
      stdio: 'inherit',
    })
  },
  uninstall: async (arg: Array<string>, global: boolean) => {
    const rc = await lmp.init()
    let cmdRc = [
    ]
    if (global) {
      cmdRc = [
        'uninstall',
        '-g',
      ]
    }
    if (arg.length === 0) {
      throw new Error('lisa uninstall 至少需要一个参数。使用方式参考 lisa uninstall --help')
    }
    if (!global) {
      cmdRc.push('remove')
      cmdRc.push(...arg)
    }
    cmdRc.push(rc)

    let excuteResolve: any = null
    const excutePromise = new Promise((resolve, _reject) => {
      excuteResolve = resolve
    })
    application.log(`${global ? 'npm' : 'yarn'} ${cmdRc.join(' ')}`)
    const res = cmd(global ? 'npm' : 'yarn', cmdRc)
    res.stdout.on('data', data => {
      Utils.getGlobal('application').log(data.toString())
    })
    res.stderr.on('data', data => {
      Utils.getGlobal('application').errorLog(data.toString())
    })
    res.on('exit', code => {
      excuteResolve(!code)
    })

    const success = await excutePromise
    return success
  },
}

export default lmp
