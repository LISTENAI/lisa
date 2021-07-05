import {job, cmd} from '@listenai/lisa_core'

module.exports = () => {
  job('init:install', {
    title: '安装lisa核心库',
    task: async () => {
      const res = await cmd('yarn', ['add', '@listenai/lisa_core', '--registry=https://registry.npm.taobao.org'], {
        cwd: process.cwd(),
      })
      if (!res) {
        throw new Error('安装lisa核心库失败')
      }
    },
  })
}
