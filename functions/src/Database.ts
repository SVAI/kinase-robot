import { Pool } from 'pg'


const pool = new Pool({
  user: 'onnofaber',
  host: 'localhost',
  database: 'rm-kinase',
  password: '',
  // port: 3211,
})

// interface MoleculeRecord {
//   // id?: integer,
//   name: string,
//   lincsId: string,
// }

export default class Database {
  constructor() {
  }

  async getRows() {
    try {
      const response = await pool.query('SELECT * FROM molecules')
      console.log(22, response)
      return response.rows
    } catch (error) {
      console.error(error)
      return
    }
  }

  static async get(table: string, query: { where?: string[] }) {
    try {
      const { where } = query
      let searchQuery = `SELECT * FROM ${table}`
      const searchValues = []
      if (where) {
        searchQuery = [searchQuery, `WHERE ${where[0]} = $1`].join(' ')
        searchValues.push(where[1])
      }
      const response = await pool.query(searchQuery, searchValues)
      console.log(22, response)
      return response.rows
    } catch (error) {
      console.error(error)
      return
    }
  }

  static async insert(table: string, obj: { [key: string]: any }) {
    try {
      const insertQuery = `INSERT INTO ${table}(${Object.keys(obj).map(v => `"${v}"`).join(', ')}) VALUES(${Object.keys(obj).map((k, i) => `$${i+1}`).join(', ')})`
      const insertValues = Object.keys(obj).map(k => obj[k])
      await pool.query(insertQuery, insertValues)
    } catch (error) {
      console.error(error)
      return
    }
  }

  // async createMolecule() {
  //   try {
  //     const response = await this.client.query('SELECT * FROM molecules')
  //     console.log(22, response)
  //     return response.rows
  //   } catch (error) {
  //     console.error(error)
  //     return
  //   }
  // }
}