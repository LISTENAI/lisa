// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface KeyVType {
  [key: string]: string;
}

export interface KeyOType {
  [key: string]: object;
}

export interface KeyAType {
  [key: string]: Array<any>;
}

export interface ItonesConfig {
  include?: any;
  tts: Tones[];
}

export interface Tones {
  id: number;
  text: string;
}

export interface InteractConfig {
  template: string;
  interact: Interact[];
}

export interface Interact {
  id?: number;
  action: Action;
  text: string;
  pinyin: string;
  cmds: string;
  play: number | string;
  status?: string;
}

export interface Iresponse {
  err: number | string;
  data: any;
}

export interface IdefaultBin {
  handlingBiasBin?: boolean;
  handlingFlashbootUrl?: boolean;
  urls?: any;
}

export interface Itone {
  id?: number;
  text: string;
  cacheName?: string;
}

export interface IcmdWord {
  id?: number;
  text: string;
  pinyin: string;
  play: any;
  cmds: any;
}

export interface Ichip {
  id: number;
  name: string;
  description?: string;
  micNum?: number;
  ttsConf?: boolean;
  esrConfig?: boolean;
  modeSwitch?: boolean;
}

export interface Ifirmware {
  id: number;
  version: string;
  description?: string;
}

export interface Ihardware {
  id: number;
  name: string;
  description?: string;
  configUrl?: string;
}

export interface Iscene {
  id: number;
  name: string;
  description?: string;
}

export interface IasrModel {
  mic_space: number;
  mic_type: string;
}

export interface IesrConfig {
  app_mode: number | string;
  esr_timeout: number | string;
}

export interface Ispeaker {
  speed: number;
  vcn: string;
  volume: number;
}

export interface IcmdsConfig {
  baudrate: number | string;
  ctrl_mode: string;
  type: string;
}

export interface IbasicConf {
  pack_demo: string;
  chip: Ichip;
  firmware: Ifirmware;
  hardware: Ihardware;
  scene: Iscene;
  asr_model?: IasrModel;
  esr_config?: IesrConfig;
  speaker?: Ispeaker;
  cmds_config?: IcmdsConfig;
}

export enum Action {
  wakeup = 'wakeup',
  cmd = 'cmd',
  welcome = 'welcome',
}
