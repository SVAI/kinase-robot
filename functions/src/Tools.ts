import * as fs from 'fs'
import Axios from 'axios'

export default class Tools {
  static async fetchLocal(path: string): Promise<string> {
    // const path = [__dirname, filename].join('/')
    let content: string
    return await new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          throw err
        }
        content = data.toString()
        resolve(content)
      })
    })
  }

  static async writeLocal(group: string, filename: string, data: string) {
    const dir = [__dirname, group].join('/')
    const path = [dir, filename].join('/')
    return await new Promise((resolve, reject) => {
      // fs.mkdir(dir, (err1) => {
        // if (err1) throw err1
      fs.writeFile(path, data, (err2) => {
        if (err2) throw err2
        resolve()
      })
      // })
    })
  }

  static async fetchRemote(url: string): Promise<string> {
    const { data } = await Axios.get(url)
    return data
  }

  static async asyncForEach(array: any[], callback: Function): Promise<any[]> {
    const returns = []
    for (let index = 0; index < array.length; index++) {
      returns.push(await callback(array[index], index, array))
    }
    return returns
  }

  static fileExists(path: string) {
    return fs.existsSync(path)
  }
}