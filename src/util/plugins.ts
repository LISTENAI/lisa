import lisa from '@listenai/lisa_core';
import { basename, join, resolve } from 'path';
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
  name: string;
  version: string;
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

async function loadPluginInfo(pluginDir: string): Promise<IPluginInfo | undefined> {
  const pkgFile = join(pluginDir, 'package.json');
  if (await lisa.fs.pathExists(pkgFile)) {
    const pkg: IPluginPackageInfo = await lisa.fs.readJson(pkgFile);
    return {
      name: pkg.name,
      friendlyName: pkg.lisa?.friendlyName || basename(pkg.name),
      version: pkg.version,
      root: pluginDir,
      package: pkg,
    };
  } else {
    return undefined;
  }
}

export async function listPlugins(): Promise<IPluginInfo[]> {
  const pluginsRoot = await getPluginsRoot();
  lisa.application.debug('listPlugins start');
  if (await lisa.fs.pathExists(pluginsRoot)) {
    const plugins = <IPluginInfo[]>[];
    for (const dir of await lisa.fs.readdir(pluginsRoot)) {
      const pluginInfo = await loadPluginInfo(join(pluginsRoot, dir));
      if (pluginInfo) {
        plugins.push(pluginInfo);
      }
    }
    lisa.application.debug(`listPlugins done, resolved ${plugins.length} plugins`);
    return plugins;
  } else {
    lisa.application.debug(`listPlugins done, no plugins`);
    return [];
  }
}

export async function getPlugin(id: string): Promise<IPluginInfo | undefined> {
  const pluginsRoot = await getPluginsRoot();
  lisa.application.debug(`getPlugin(${id}) start`);
  const pluginInfo = await loadPluginInfo(join(pluginsRoot, id));
  if (pluginInfo) {
    lisa.application.debug(`getPlugin(${id}) done, resolved`);
    return pluginInfo;
  } else {
    lisa.application.debug(`getPlugin(${id}) done, not found`);
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
