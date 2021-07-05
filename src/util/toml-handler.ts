import * as fs from 'fs'
import * as TOML from '@iarna/toml'

const tomlHandler =  {
  parse: (file: string) => {
    const data = fs.readFileSync(file).toString()
    return TOML.parse(data)
  },
  stringify: (data: any) => {
    return TOML.stringify(data)
  },
  load: (file: string) => {
    const data = fs.readFileSync(file).toString()
    return TOML.parse(data)
  },
  save: (file: string, obj: any) => {
    const content = TOML.stringify(obj)
    fs.writeFileSync(file, content)
  },
}

export default tomlHandler
