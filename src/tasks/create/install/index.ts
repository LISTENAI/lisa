import {job, cmd} from '@listenai/lisa_core'
module.exports = () => {
  job('create:install', {
    title: '初始化安装依赖',
    task: async (ctx: any) => {
      const res = await cmd('lisa', ['install', '@listenai/lisa_core', ctx.application.context.lisaCreate.generate], {
        cwd: ctx.fs.project.root,
        // env: {
        //   lisaAccessToken: '8adc71e9-960e-4a71-b8fc-25f3ab21178e',
        // },
      })
      if (res.stdout.indexOf('成功') < 0) {
        throw new Error(`安装依赖失败，log信息存放在：${ctx.fs.project.root}/.lisa`)
      }
    },
  })
}
