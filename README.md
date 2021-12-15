@listenai/lisa
=====

Lisa 是 Lisa Framework 核心命令行工具，提供模版生成能力以及任务执行命令

[![Version](https://img.shields.io/npm/v/@listenai/lisa.svg)](https://npmjs.org/package/@listenai/lisa)
[![Downloads/week](https://img.shields.io/npm/dw/@listenai/lisa.svg)](https://npmjs.org/package/@listenai/lisa)
[![License](https://img.shields.io/npm/l/@listenai/lisa.svg)](https://github.com/LISTENAI/lisa/blob/master/package.json)

* [Usage](#usage)
* [Commands](#commands)

# Usage
<!-- usage -->
```sh-session
$ npm install -g @listenai/lisa
$ lisa COMMAND
running command...
$ lisa (-v|--version|version)
@listenai/lisa/2.1.3 win32-x64 node-v16.13.0
$ lisa --help [COMMAND]
USAGE
  $ lisa COMMAND
...
```
<!-- usagestop -->

# Commands
<!-- commands -->
* [`lisa build`](#lisa-build)
* [`lisa create [NAME]`](#lisa-create-name)
* [`lisa flash [FILEPATH]`](#lisa-flash-filepath)
* [`lisa info [PLUGINNAME]`](#lisa-info-pluginname)
* [`lisa install [PKG]`](#lisa-install-pkg)
* [`lisa login`](#lisa-login)
* [`lisa plugins`](#lisa-plugins)
* [`lisa task [ID]`](#lisa-task-id)
* [`lisa tools [PUBLISH]`](#lisa-tools-publish)
* [`lisa uninstall [PKG]`](#lisa-uninstall-pkg)
* [`lisa update`](#lisa-update)
* [`lisa upgrade`](#lisa-upgrade)

## `lisa build`

固件开发项目编译打包

```
USAGE
  $ lisa build

OPTIONS
  -r, --release  打包release包
  --factory      打包factory包
```

_See code: [src/commands/build.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/build.ts)_

## `lisa create [NAME]`

创建项目，例`lisa create newProject -t @generator/csk`

```
USAGE
  $ lisa create [NAME]

ARGUMENTS
  NAME  项目名称

OPTIONS
  -t, --template=template  生成器模板
```

_See code: [src/commands/create.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/create.ts)_

## `lisa flash [FILEPATH]`

烧录程序

```
USAGE
  $ lisa flash [FILEPATH]

ARGUMENTS
  FILEPATH  烧录的lpk包绝对路径，非必填，默认烧录csk开发项目package后的lpk包

OPTIONS
  -p, --part=part  选择烧录part文件，例：'-p master -p script'，默认全部烧录
```

_See code: [src/commands/flash.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/flash.ts)_

## `lisa info [PLUGINNAME]`

查看环境信息

```
USAGE
  $ lisa info [PLUGINNAME]

ARGUMENTS
  PLUGINNAME  检查的目标项目，例：'zephyr'，不填时默认检查默认环境
```

_See code: [src/commands/info.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/info.ts)_

## `lisa install [PKG]`

安装依赖

```
USAGE
  $ lisa install [PKG]

ARGUMENTS
  PKG  资源包名，例：'@source/csk4002'，不填时默认安装lisa项目中的依赖
```

_See code: [src/commands/install.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/install.ts)_

## `lisa login`

登录

```
USAGE
  $ lisa login
```

_See code: [src/commands/login.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/login.ts)_

## `lisa plugins`

查看lisa扩展包

```
USAGE
  $ lisa plugins
```

_See code: [src/commands/plugins.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/plugins.ts)_

## `lisa task [ID]`

执行tasks，可执行的task输入`lisa task -T`命令查看

```
USAGE
  $ lisa task [ID]

ARGUMENTS
  ID  task id

OPTIONS
  -T, --table  表格展示所有可执行的task
  --json       json展示所有可执行的task
  --verbose    日志全量输出
```

_See code: [src/commands/task.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/task.ts)_

## `lisa tools [PUBLISH]`

终端工具

```
USAGE
  $ lisa tools [PUBLISH]

ARGUMENTS
  PUBLISH  启动发布流程
```

_See code: [src/commands/tools.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/tools.ts)_

## `lisa uninstall [PKG]`

移除依赖

```
USAGE
  $ lisa uninstall [PKG]

ARGUMENTS
  PKG  资源包名，例：'@alge/general'
```

_See code: [src/commands/uninstall.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/uninstall.ts)_

## `lisa update`

更新lisa到最新版本

```
USAGE
  $ lisa update
```

_See code: [src/commands/update.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/update.ts)_

## `lisa upgrade`

更新当前项目依赖

```
USAGE
  $ lisa upgrade
```

_See code: [src/commands/upgrade.ts](https://github.com/LISTENAI/lisa/blob/v2.1.3/src/commands/upgrade.ts)_
<!-- commandsstop -->
