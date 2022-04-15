#!/usr/bin/env node
if (process && process.argv.indexOf('--debug') >= 0) {
  process.env.DEBUG = '*'
  process.argv = process.argv.filter(item => item !== '--debug')
}
import { Command } from '@oclif/command'
import { platform } from 'os'
if (process.env.LISA_PREFIX) {
  const oldPath = process.env[findPathKey()]
  let newPath = []
  switch(platform()) {
    case 'win32':
      newPath = oldPath.split(';').filter(item => {
        // 保留git和系统相关Path
        return item.toLowerCase().indexOf('git') > 0 || item.toLowerCase().indexOf('windows') > 0
      })
      newPath.push(process.env.LISA_PREFIX)
      process.env[findPathKey()] = `${newPath.join(';')}`
      delete process.env['HOME']
      break
    case 'darwin':
      newPath.push(`${process.env.LISA_PREFIX}/libexec`)
      newPath.push(`${process.env.LISA_PREFIX}/bin`)
      newPath = newPath.concat(oldPath)
      process.env[findPathKey()] = `${newPath.join(':')}`
      break
  }
}

function findPathKey(): string {
  for (const key in process.env) {
    if (key.toLowerCase() == 'path') {
      return key
    }
  }
  return 'PATH'
}

const Sentry = require('@sentry/node')
Sentry.init({
  dsn: 'http://043e699dd29e4c6fb1de231a729f8aa4@sentry.iflyos.cn/95',
  tracesSampleRate: 1.0,
})

class BeforeRunCommand extends Command {
  async run() {
    this.config.runHook('checkUpdate', {})
    this.config.runHook('event', {})
  }
}
BeforeRunCommand.run()



require('@oclif/command').run()
  .then(require('@oclif/command/flush'))
  .catch(async (error) => {
    const oclifHandler = require('@oclif/errors/handle')
    // do any extra work with error
    const Configstore = require('configstore')
    const config = new Configstore('lisa')
    const lisaUserInfo = config.get('userInfo') || {}

    await new Promise<void>((res, _rej) => {
      Sentry.withScope(function (scope) {
        scope.setTag('lisaVersion', config.get('version') || '');
        scope.setTag('userid', lisaUserInfo.id || '');
        scope.setTag('username', lisaUserInfo.username || '');
        scope.setTag('accountName', lisaUserInfo.accountName || '');
        scope.setTag('email', lisaUserInfo.email || '');
        scope.setTag('accessToken', lisaUserInfo.accessToken || '');
        Sentry.captureException(error, () => {
          res()
        });
      });
    })
    return oclifHandler(error)
  })


