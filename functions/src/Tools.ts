import * as fs from 'fs'
import Axios from 'axios'

export default class Tools {
  static async fetchLocal(filename: string): Promise<string> {
    const path = [__dirname, filename].join('/')
    let content: string
    console.log('dir', __dirname)
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

  async fetchRemote(url: string): Promise<string> {
    const { data } = await Axios.get(url)
    return data
  }
}