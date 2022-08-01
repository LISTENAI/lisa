import lisa from '@listenai/lisa_core';
import { join, resolve } from 'path';
import { CompletionItem, TabtabEnv } from 'tabtab';

const CACHE_DIR = resolve(__dirname, '..', '..', 'var');

const SCOPE_NAME = '@lisa-plugin';

export interface IPluginInfo {
  name: string;
  friendlyName: string;
  version: string;
  root: string;
  package: IPluginPackageInfo;
}

export interface IPluginPackageInfo {
  version?: string;
  engines?: Record<string, string>;
  main?: string;
  lisa?: {
    friendlyName?: string;
    completion?: string;
  };
}

export interface IPluginMain {
  env?: () => Promise<Record<string, string>>;
}

export interface IPluginCompletion {
  (env: TabtabEnv): Promise<CompletionItem[] | string[] | undefined>;
}

export async function listPlugins(): Promise<IPluginInfo[]> {
  const pluginsRoot = await getPluginsRoot();
  if (await lisa.fs.pathExists(pluginsRoot)) {
    const plugins = <IPluginInfo[]>[];
    for (const dir of await lisa.fs.readdir(pluginsRoot)) {
      const pkgFile = join(pluginsRoot, dir, 'package.json');
      if (await lisa.fs.pathExists(pkgFile)) {
        const pkg: IPluginPackageInfo = await lisa.fs.readJson(pkgFile);
        plugins.push({
          name: `${SCOPE_NAME}/${dir}`,
          friendlyName: pkg.lisa?.friendlyName || dir,
          version: pkg.version,
          root: join(pluginsRoot, dir),
          package: pkg,
        });
      }
    }
    return plugins;
  } else {
    return [];
  }
}

export async function getPlugin(id: string): Promise<IPluginInfo | undefined> {
  const pluginsRoot = await getPluginsRoot();
  const pkgFile = join(pluginsRoot, id, 'package.json');
  if (await lisa.fs.pathExists(pkgFile)) {
    const pkg: IPluginPackageInfo = await lisa.fs.readJson(pkgFile);
    return {
      name: `${SCOPE_NAME}/${id}`,
      friendlyName: pkg.lisa?.friendlyName || id,
      version: pkg.version,
      root: join(pluginsRoot, id),
      package: pkg,
    };
  } else {
    return undefined;
  }
}

async function getNpmRoot(): Promise<string> {
  lisa.application.debug('getNpmRoot start');
  const symlink = join(CACHE_DIR, 'npm-root');
  if (!(await lisa.fs.pathExists(symlink))) {
    lisa.application.debug('getNpmRoot not cahched, resolving...');
    const { stdout: npmRoot } = await lisa.cmd('npm', ['root', '-g']);
    await lisa.fs.ensureSymlink(npmRoot, symlink);
    lisa.application.debug('getNpmRoot resolved and cached');
  }
  lisa.application.debug(`getNpmRoot done: ${symlink}`);
  return symlink;
}

async function getPluginsRoot(): Promise<string> {
  lisa.application.debug('getPluginsRoot start');
  const npmRoot = await getNpmRoot();
  const pluginsRoot = resolve(npmRoot, SCOPE_NAME);
  lisa.application.debug(`getPluginsRoot done: ${pluginsRoot}`);
  return pluginsRoot;
}
