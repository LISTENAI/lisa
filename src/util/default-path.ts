import * as fs from 'fs'
import * as path from 'path'

const defaultPath = {
  cwd: (fileName?: string) => {
    const _path = process.cwd()
    return fileName ? path.join(_path, fileName) : _path
  },

  targetPath: (fileName?: string) => {
    const _path = path.join(process.cwd(), 'target')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  logPath: (fileName?: string) => {
    const _path = path.join(defaultPath.targetPath(), 'log')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  outputPath: (fileName?: string) => {
    const _path = path.join(defaultPath.targetPath(), 'output')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  thresholdsPath(fileName?: string) {
    if (!fs.existsSync(path.join(this.cwd(), '/config/thresholds/'))) {
      fs.mkdirSync(path.join(this.cwd(), '/config/thresholds'))
    }
    return fileName ? path.join(path.join(this.cwd(), '/config/thresholds'), fileName) : path.join(this.cwd(), '/config/thresholds')
  },

  newBuildPath(fileName?: any) {
    if (!fs.existsSync(this.targetPath('build'))) {
      fs.mkdirSync(this.targetPath('build'))
    }
    return fileName ? path.join(this.targetPath('build'), fileName) : this.targetPath('build')
  },

  environmentPath(fileName?: string) {
    if (!fs.existsSync(path.join(this.cwd(), '/config/environment/'))) {
      fs.mkdirSync(path.join(this.cwd(), '/config/environment'))
    }
    return fileName ? path.join(path.join(this.cwd(), '/config/environment'), fileName) : path.join(this.cwd(), '/config/environment')
  },
  configPath: (fileName?: string) => {
    const _path = path.join(process.cwd(), 'config')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  buildingPath: (fileName?: string) => {
    const _path = path.join(defaultPath.targetPath(), '.building')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  buildingTonesPath: (fileName?: string) => {
    const _path = path.join(defaultPath.buildingPath(), 'tones')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  tonesCachePath: (fileName?: string) => {
    const _path = path.join(process.env.ListenAiCachePath || '', 'tones')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  debugPath: (fileName?: string) => {
    const _path = path.join(defaultPath.outputPath(), 'debug')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  releasePath: (fileName?: string) => {
    const _path = path.join(defaultPath.outputPath(), 'release')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },

  partsPath: (fileName?: string) => {
    const _path = path.join(defaultPath.outputPath(), 'parts')
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path)
    }
    return fileName ? path.join(_path, fileName) : _path
  },
}

export default defaultPath
