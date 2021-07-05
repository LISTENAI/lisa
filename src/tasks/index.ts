import * as path from 'path'
require(path.join(__dirname, './create/init'))()
require(path.join(__dirname, './create/install'))()
require(path.join(__dirname, './init/ready'))()
require(path.join(__dirname, './init/install'))()

require(path.join(__dirname, './flash/compress'))()
require(path.join(__dirname, './flash/parseJson'))()
require(path.join(__dirname, './flash/parseZip'))()

require(path.join(__dirname, './lpk-package'))()
