@listenai/lisa
=====

Lisa 是 Lisa Framework 核心命令行工具，提供模版生成能力以及任务执行命令

[![Version](https://img.shields.io/npm/v/@listenai/lisa.svg)](https://npmjs.org/package/@listenai/lisa)
[![Downloads/week](https://img.shields.io/npm/dw/@listenai/lisa.svg)](https://npmjs.org/package/@listenai/lisa)
[![License](https://img.shields.io/npm/l/@listenai/lisa.svg)](https://github.com/LISTENAI/lisa/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
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
```sh-session
$ npm install -g @listenai/lisa
$ lisa COMMAND
running command...
$ lisa (-v|--version|version)
@listenai/lisa/2.0.2 win32-x64 node-v12.22.0
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
* [`lisa build`](#lisa-build)
* [`lisa create [NAME]`](#lisa-create-name)
* [`lisa flash [FILEPATH]`](#lisa-flash-filepath)
* [`lisa install [PKG]`](#lisa-install-pkg)
* [`lisa login`](#lisa-login)
* [`lisa plugins`](#lisa-plugins)
* [`lisa plugins:inspect PLUGIN...`](#lisa-pluginsinspect-plugin)
* [`lisa plugins:install PLUGIN...`](#lisa-pluginsinstall-plugin)
* [`lisa plugins:link PLUGIN`](#lisa-pluginslink-plugin)
* [`lisa plugins:uninstall PLUGIN...`](#lisa-pluginsuninstall-plugin)
* [`lisa plugins:update`](#lisa-pluginsupdate)
* [`lisa task [ID]`](#lisa-task-id)
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

_See code: [src/commands/build.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/build.ts)_

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

_See code: [src/commands/create.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/create.ts)_

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

_See code: [src/commands/flash.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/flash.ts)_

## `lisa install [PKG]`

安装依赖

```
USAGE
  $ lisa install [PKG]

ARGUMENTS
  PKG  资源包名，例：'@source/csk4002'，不填时默认安装lisa项目中的依赖
```

_See code: [src/commands/install.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/install.ts)_

## `lisa login`

登录

```
USAGE
  $ lisa login
```

_See code: [src/commands/login.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/login.ts)_

## `lisa plugins`

list installed plugins

```
USAGE
  $ lisa plugins

OPTIONS
  --core  show core plugins

EXAMPLE
  $ lisa plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.1/src/commands/plugins/index.ts)_

## `lisa plugins:inspect PLUGIN...`

displays installation properties of a plugin

```
USAGE
  $ lisa plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] plugin to inspect

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

EXAMPLE
  $ lisa plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.1/src/commands/plugins/inspect.ts)_

## `lisa plugins:install PLUGIN...`

installs a plugin into the CLI

```
USAGE
  $ lisa plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  plugin to install

OPTIONS
  -f, --force    yarn install with force flag
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command 
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in 
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ lisa plugins:add

EXAMPLES
  $ lisa plugins:install myplugin 
  $ lisa plugins:install https://github.com/someuser/someplugin
  $ lisa plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.1/src/commands/plugins/install.ts)_

## `lisa plugins:link PLUGIN`

links a plugin into the CLI for development

```
USAGE
  $ lisa plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello' 
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLE
  $ lisa plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.1/src/commands/plugins/link.ts)_

## `lisa plugins:uninstall PLUGIN...`

removes a plugin from the CLI

```
USAGE
  $ lisa plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

ALIASES
  $ lisa plugins:unlink
  $ lisa plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.1/src/commands/plugins/uninstall.ts)_

## `lisa plugins:update`

update installed plugins

```
USAGE
  $ lisa plugins:update

OPTIONS
  -h, --help     show CLI help
  -v, --verbose
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.1/src/commands/plugins/update.ts)_

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

_See code: [src/commands/task.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/task.ts)_

## `lisa uninstall [PKG]`

移除依赖

```
USAGE
  $ lisa uninstall [PKG]

ARGUMENTS
  PKG  资源包名，例：'@alge/general'
```

_See code: [src/commands/uninstall.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/uninstall.ts)_

## `lisa update`

更新lisa到最新版本

```
USAGE
  $ lisa update
```

_See code: [src/commands/update.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/update.ts)_

## `lisa upgrade`

更新当前项目依赖

```
USAGE
  $ lisa upgrade
```

_See code: [src/commands/upgrade.ts](https://github.com/LISTENAI/lisa/blob/v2.0.2/src/commands/upgrade.ts)_
<!-- commandsstop -->
