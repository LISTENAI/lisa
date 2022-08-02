#!/usr/bin/env node
import lisa from '@listenai/lisa_core';
import { join } from 'path';
import * as tabtab from 'tabtab';
import { getPluginByFriendlyName, IPluginCompletion, IPluginInfo, listPlugins } from './util/plugins';

(async () => {
  const env = tabtab.parseEnv(process.env);
  if (!env.complete) return;

  if (env.words == 1) {
    return tabtab.log((await listPlugins()).map((plugin) => ({
      name: plugin.friendlyName,
      description: plugin.name,
    })));
  }

  const match = env.line.match(/^lisa (\S+) /);
  if (match) {
    const plugin = await getPluginByFriendlyName(match[1]);
    if (plugin?.package.lisa?.completion) {
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
  }
})();
