import * as Configstore from 'configstore'
import lisa from '@listenai/lisa_core'
import compare from '../../util/compare'

const ONE_DAY = 86400000

async function getLatestVersion() {
  const config = new Configstore('lisa')
  const { application, cmd } = lisa
  try {
    const res = await cmd('npm', ['view', '@listenai/lisa', 'dist-tags'])
    const distTags = JSON.parse(res.stdout.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"'))
    application.debug(distTags)
    const latestVersion = distTags.latest
    config.set('versionCheckInfo', {
      latest: latestVersion,
      expire: new Date().getTime() + ONE_DAY,
    })
    return latestVersion
  } catch (error) {
    application.debug(error)
  }
  return '0.0.0'
}

const checkUpdate = async function () {
  const config = new Configstore('lisa')
  const versionCheckInfo = config.get('versionCheckInfo')
  this.debug(versionCheckInfo)

  const nowVersion = this.config.version
  this.debug('当前版本 %s', nowVersion)
  config.set('version', nowVersion)
  let latestVersion = versionCheckInfo?.latest || ''
  // 当无记录到latest版本，或expire过期
  if (!latestVersion || (versionCheckInfo?.expire && versionCheckInfo?.expire - new Date().getTime() <= 0)) {
    latestVersion = await getLatestVersion()
  }
  if (compare(nowVersion, latestVersion) < 0) {
    this.log(`发现可更新的版本: ${latestVersion}，执行 lisa update 进行更新`)
  }

}

export default checkUpdate
