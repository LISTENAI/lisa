lisa
====

Lisa 是 Lisa Framework 核心命令行工具，提供模版生成能力以及任务执行命令

* [Usage](#usage)
* [Commands](#commands)

# Usage

```sh-session
$ npm install -g @listenai/lisa
$ lisa COMMAND
running command...
$ lisa (-v|--version|version)
@listenai/lisa/1.4.7 darwin-x64 node-v12.3.1
$ lisa --help [COMMAND]
USAGE
  $ lisa COMMAND
...
```

# Commands
* [`lisa build`](#lisa-build)
* [`lisa create NAME`](#lisa-create-name)
* [`lisa flash [FILEPATH]`](#lisa-flash-filepath)
* [`lisa help [COMMAND]`](#lisa-help-command)
* [`lisa init`](#lisa-init)
* [`lisa install [PKG]`](#lisa-install-pkg)
* [`lisa list`](#lisa-list)
* [`lisa pipeline [ID]`](#lisa-pipeline-id)
* [`lisa plugins`](#lisa-plugins)
* [`lisa plugins:inspect PLUGIN...`](#lisa-pluginsinspect-plugin)
* [`lisa plugins:install PLUGIN...`](#lisa-pluginsinstall-plugin)
* [`lisa plugins:link PLUGIN`](#lisa-pluginslink-plugin)
* [`lisa plugins:uninstall PLUGIN...`](#lisa-pluginsuninstall-plugin)
* [`lisa plugins:update`](#lisa-pluginsupdate)
* [`lisa publish`](#lisa-publish)
* [`lisa search KEYWORD`](#lisa-search-keyword)
* [`lisa task [ID]`](#lisa-task-id)
* [`lisa uninstall [PKG]`](#lisa-uninstall-pkg)
* [`lisa update`](#lisa-update)
* [`lisa upgrade`](#lisa-upgrade)
* [`lisa view PKG [FIELD]`](#lisa-view-pkg-field)

## `lisa build`

固件开发项目编译打包

```
USAGE
  $ lisa build

OPTIONS
  -r, --release  打包release包
  --factory      打包factory包
```

## `lisa create NAME`

创建项目，例`lisa create newProject -t @generator/csk`

```
USAGE
  $ lisa create NAME

ARGUMENTS
  NAME  项目名称

OPTIONS
  -t, --template=template  (required) 生成器模板
```

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

## `lisa help [COMMAND]`

display help for lisa

```
USAGE
  $ lisa help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `lisa init`

项目初始化

```
USAGE
  $ lisa init
```

## `lisa install [PKG]`

安装依赖

```
USAGE
  $ lisa install [PKG]

ARGUMENTS
  PKG  资源包名，例：'@source/csk4002'，不填时默认安装lisa项目中的依赖

OPTIONS
  -g, --global  全局安装依赖
```

## `lisa list`

列出项目已安装的Modules

```
USAGE
  $ lisa list
```

## `lisa pipeline [ID]`

执行pipeline，可执行的pipeline输入`lisa pipeline -T`命令查看

```
USAGE
  $ lisa pipeline [ID]

ARGUMENTS
  ID  pipleLine id

OPTIONS
  -T, --table  表格展示所有可执行的pipeline
  --json       json展示所有可执行的pipeline
```

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.0/src/commands/plugins/index.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.0/src/commands/plugins/inspect.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.0/src/commands/plugins/install.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.0/src/commands/plugins/link.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.0/src/commands/plugins/uninstall.ts)_

## `lisa plugins:update`

update installed plugins

```
USAGE
  $ lisa plugins:update

OPTIONS
  -h, --help     show CLI help
  -v, --verbose
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.10.0/src/commands/plugins/update.ts)_

## `lisa publish`

发布到lpm库

```
USAGE
  $ lisa publish
```

## `lisa search KEYWORD`

根据关键字查找pkg

```
USAGE
  $ lisa search KEYWORD

ARGUMENTS
  KEYWORD  关键字，例：'tool'
```

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

## `lisa uninstall [PKG]`

移除依赖

```
USAGE
  $ lisa uninstall [PKG]

ARGUMENTS
  PKG  资源包名，例：'@tool/nds-toolchain @tool/cskburn'

OPTIONS
  -g, --global  全局移除依赖
```

## `lisa update`

更新lisa到最新版本

```
USAGE
  $ lisa update
```

## `lisa upgrade`

更新当前项目依赖

```
USAGE
  $ lisa upgrade

OPTIONS
  --latest  依赖更新到最新版本
```

## `lisa view PKG [FIELD]`

查看pkg相关信息

```
USAGE
  $ lisa view PKG [FIELD]

ARGUMENTS
  PKG    包名，如`@listenai/lisa`
  FIELD  [default: versions] 查看包的相关信息，如`versions`,`dependencies`
```
