/* eslint-disable node/no-unsupported-features/node-builtins */
import {Command, flags} from '@oclif/command'
import Utils from '../lib/utils'
import * as Configstore from 'configstore'
import compare from '../util/compare'

import {application, fs, runner, Application, cmd, argv} from '@listenai/lisa_core'

const config = new Configstore('lisa')

export default class Create extends Command {
  static description = '创建项目，例`lisa create newProject -t @generator/csk`';

  static args = [
    {
      name: 'name',
      required: true,
      description: '项目名称',
    },
  ];

  static flags = {
    template: flags.string({
      char: 't',
      description: '生成器模板',
      required: true,
    }),
  };

  async run() {
    const self = this
    const {args, flags} = this.parse(Create)
    const projectName = args.name
    if (projectName !== '.') {
      const projectNamePattern = /^[_a-zA-Z0-9-]+$/
      if (!projectNamePattern.test(projectName)) {
        return this.error('项目名称只能使用数字、英文字母、下划线')
      }
    }
    const generate = flags.template
    let installGenerate = generate;
    ((global as any).application as Application) =  application;
    ((global as any).fs) =  fs
    Utils.getGlobal('fs').project.root = Utils.getGlobal('fs').project.join(projectName)

    if (process.env.LISA_ENV === 'debug') {
      const generatorVersionSearchRes = await cmd('npm', ['view', generate, 'versions', config.get('lpmRc')])
      const listStr = generatorVersionSearchRes.stdout.split('\n').join('').replace(/'/g, '"')
      let generatorVersionList = JSON.parse(listStr)
      generatorVersionList = generatorVersionList.filter((item: string) => !item.match(/^([1-9]\d|[1-9])(\.([1-9]\d|\d)){2}$/))
      generatorVersionList = generatorVersionList.sort(function (item1: any, item2: any) {
        return compare(item2, item1)
      })
      installGenerate += `${generatorVersionList[0] ? '@' : ''}${generatorVersionList[0] || ''}`
      this.log(installGenerate)
    }

    Utils.getGlobal('application').addContext('lisaCreate', {
      projectName: projectName,
      generate: installGenerate,
    })

    runner(Utils.getPipelineTask('create')).then(async () => {
      const execStr = [
        "const core=require('@listenai/lisa_core');",
        `core.application.argv = ${JSON.stringify(argv())};`.replace(/"/g, "'"),
        `const main=require('${generate}');`,
        'main.default(core);',
      ]
      await cmd('node', ['-e', `"${execStr.join('')}"`], {
        cwd: Utils.getGlobal('fs').project.root,
        shell: true,
        stdio: 'inherit',
      })
      try {
        await cmd('lstudio', ['.'], {
          cwd: Utils.getGlobal('fs').project.root,
          shell: true,
          stdio: 'inherit',
        })
      } catch (error) {

      }
    }).catch((error: any) => {
      self.error(error)
    })
  }
}
