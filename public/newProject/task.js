module.exports = core => {
  const {job} = core
  job('demo', {
    title: 'demo task',
    task: async (ctx, task) => {
      ctx.input = await task.prompt({type: 'Toggle', message: 'Do you love lisa?'})
    },
  })
}
