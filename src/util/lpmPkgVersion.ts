import * as Configstore from 'configstore'
import lisa from '@listenai/lisa_core'
import lpminit from './lpminit'

const ONE_DAY = 86400000

async function lpmPkgVersion(pkg: string): Promise<string> {
  const {cmd, application} = lisa

  const config = new Configstore('lisa')
  const lpmVersionCheckInfo = config.get('lpmVersionCheckInfo') || {}

  const pkgCheckInfo = lpmVersionCheckInfo[pkg] || {}

  let latestVersion = pkgCheckInfo?.latest || ''
  // 当无记录到latest版本，或expire过期
  if (!latestVersion || (pkgCheckInfo?.expire && pkgCheckInfo?.expire - new Date().getTime() <= 0)) {
    try {
      await lpminit()
      const distTags = await cmd('npm', ['view', pkg, 'dist-tags', '--json', `--registry=${application.registryUrl}`])
      latestVersion = JSON.parse(distTags.stdout.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"'))?.latest
      lpmVersionCheckInfo[pkg] = {
        latest: latestVersion,
        expire: new Date().getTime() + ONE_DAY,
      }
      config.set('lpmVersionCheckInfo', lpmVersionCheckInfo)
    } catch (error) {}
  }
  return latestVersion
}

export default lpmPkgVersion
