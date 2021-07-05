import {IbasicConf, Ichip, Ifirmware, Ihardware, Iscene, KeyVType} from '../data'
import request from '../util/request'

export default class PreNew {
  async getBasicConf(chipName: string, firmwareVersion: string, hardwareName: string) {
    const chip: Ichip = (await this.getChipConf(chipName) as unknown as Ichip)
    const firmware: Ifirmware = (await this.getFirmwareConf(chip.id, firmwareVersion) as unknown as Ifirmware)
    const hardware: Ihardware = (await this.getHardwareConf(firmware.id, hardwareName) as unknown as Ihardware)
    const scene: Iscene = (await this.getScenes(firmware.id) as unknown as Iscene)
    const basicConf: IbasicConf = {
      pack_demo: 'custom',
      chip,
      firmware,
      hardware,
      scene,
      asr_model: {
        mic_space: 35,
        mic_type: '模拟麦克风',
      },
      cmds_config: {
        baudrate: '115200',
        ctrl_mode: 'uart',
        type: 'hex',
      },
    }
    if (chip.esrConfig) {
      basicConf.esr_config = {
        app_mode: 3,
        esr_timeout: 20,
      }
    }
    if (chip.ttsConf) {
      basicConf.speaker = {
        speed: 1.08,
        vcn: 'x2_yezi',
        volume: 10,
      }
    }
    return basicConf
  }

  async getChipConf(chipName: string) {
    const res = await request({
      method: 'GET',
      url: '/chips',
    })
    if (!res.err) {
      const chip: Ichip = res.data.find((chip: Ichip) => chip.name === chipName)
      return {
        id: chip.id,
        name: chip.name,
        description: chip.description,
        micNum: chip.micNum,
        ttsConf: chip.ttsConf,
        esrConfig: chip.esrConfig,
        modeSwitch: chip.modeSwitch,
      }
    }
    throw new Error(`未找到该芯片类型:${chipName}`)
  }

  async getFirmwareConf(chipId: number, firmwareVersion: string) {
    const res = await request({
      method: 'GET',
      url: `/firmwares?chipId=${chipId}`,
    })
    if (!res.err) {
      // const firmware: Ifirmware = res.data.find((firmware: Ifirmware) => firmware.version === firmwareVersion)
      const firmware: Ifirmware = res.data.find((firmware: Ifirmware) => firmware.version === '3.0.2')
      return {
        id: firmware.id,
        version: firmware.version,
        description: firmware.description,
      }
    }
    throw new Error(`未找到该固件版本:${firmwareVersion}`)
  }

  async getHardwareConf(firmwareId: number, hardwareName: string) {
    const hardwareDict: KeyVType = {
      'ls-kit': '聆思开发板v1.0',
    }
    const res = await request({
      method: 'GET',
      url: `/hardwares?firmwareId=${firmwareId}`,
    })
    if (!res.err) {
      const hardware: Ihardware = res.data.find((hardware: Ihardware) => hardware.name === hardwareDict[hardwareName])
      return {
        id: hardware.id,
        name: hardware.name,
        description: hardware.description,
        configUrl: hardware.configUrl,
      }
    }
    throw new Error(`未找到该板型:${hardwareName}`)
  }

  async getScenes(firmwareId: number) {
    const res = await request({
      method: 'GET',
      url: `/scenes?firmwareId=${firmwareId}`,
    })
    if (!res.err) {
      const scene: Iscene = res.data[0]
      return {
        id: scene.id,
        name: scene.name,
        description: scene.description,
      }
    }
    return {}
  }
}

