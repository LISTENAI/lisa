import * as path from 'path'

const models = [
  './create/init',
  './create/install',
  './init/ready',
  './init/install',
  './flash/compress',
  './flash/parseJson',
  './flash/parseZip',
  './lpk-package'
]

models.forEach((module_path) => {
  import(path.join(__dirname, module_path)).then((lib) => lib())
})