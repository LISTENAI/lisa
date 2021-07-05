import {exec} from 'child_process'
import defaultPath from './default-path'
import * as fs from 'fs'

const cpExec = {
  run: async (cmdStr: string, cwd: string) => {
    let cmdResolver: { (arg0: number): void; (value: unknown): void } | null = null
    const cmdDonePromise = new Promise(r => {
      cmdResolver = r
    })

    const workerProcess = exec(cmdStr, {
      cwd: cwd,
    })
    workerProcess.stdout.on('data', function (data) {
      if (fs.existsSync(defaultPath.logPath('exec.log'))) {
        fs.appendFileSync(defaultPath.logPath('exec.log'), data)
      } else {
        fs.writeFileSync(defaultPath.logPath('exec.log'), data)
      }
    })
    workerProcess.stderr.on('data', function (data) {
      if (fs.existsSync(defaultPath.logPath('exec-error.log'))) {
        fs.appendFileSync(defaultPath.logPath('exec-error.log'), data)
      } else {
        fs.writeFileSync(defaultPath.logPath('exec-error.log'), data)
      }
    })
    workerProcess.on('close', code => {
      cmdResolver && cmdResolver(code)
    })
    const proRes = await cmdDonePromise
    if (proRes === 0) {
      return true
    }
    return false
  },
  get: async (cmdStr: string, cwd: any) => {
    let cmdResolver: { (arg0: number): void; (value: unknown): void } | null = null
    const cmdDonePromise = new Promise(r => {
      cmdResolver = r
    })

    exec(cmdStr, {
      cwd: cwd,
    }, (error, stdout, _stderr) => {
      if (error) {
        cmdResolver && cmdResolver(false)
        return
      }
      cmdResolver && cmdResolver(stdout)
    })
    const proRes = await cmdDonePromise
    return proRes
  },
  log: async (cmdStr: string, cwd: string, self: any) => {
    let cmdResolver: { (arg0: number): void; (value: unknown): void } | null = null
    const cmdDonePromise = new Promise(r => {
      cmdResolver = r
    })

    const workerProcess = exec(cmdStr, {
      cwd: cwd,
    })
    workerProcess.stdout.on('data', function (data) {
      self.log(data)
    })
    workerProcess.stderr.on('data', function (data) {
      self.log(data)
    })
    workerProcess.on('close', code => {
      cmdResolver && cmdResolver(code)
    })
    const proRes = await cmdDonePromise
    if (proRes === 0) {
      return true
    }
    return false
  },
}

export default cpExec
