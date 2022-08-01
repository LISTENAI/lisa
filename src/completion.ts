#!/usr/bin/env node
import lisa from '@listenai/lisa_core';
import { join } from 'path';
import * as tabtab from 'tabtab';
import { IPluginCompletion, IPluginInfo, listPlugins } from './util/plugins';

(async () => {
  const env = tabtab.parseEnv(process.env);
  if (!env.complete) return;

  const plugins: Record<string, IPluginInfo> = (await listPlugins())
    .reduce((plugins, plugin) => {
      plugins[plugin.friendlyName] = plugin;
      return plugins;
    }, {});

  if (env.words == 1) {
    return tabtab.log(Object.values(plugins).map((plugin) => ({
      name: plugin.friendlyName,
      description: plugin.name,
    })));
  }

  const match = env.line.match(/^lisa (\S+) /);
  if (match && plugins[match[1]] && plugins[match[1]].package.lisa?.completion) {
    const plugin = plugins[match[1]];
    const completionScript = join(plugin.root, plugin.package.lisa.completion);
    if (await lisa.fs.pathExists(completionScript)) {
      const completionModule = await import(completionScript);
      const completionFn = completionModule.default as IPluginCompletion;
      const completion = typeof completionFn == 'function' && await completionFn(env);
      if (completion) {
        return tabtab.log(completion);
      }
    }
  }
})();
