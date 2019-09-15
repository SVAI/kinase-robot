import { Pool } from 'pg'


const pool = new Pool({
  user: 'onnofaber',
  host: 'localhost',
  database: 'rm-kinase',
  password: '',
  // port: 3211,
})

interface QueryObject {
  where?: string[],
  limit?: number,
}

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

  static async first(table: string, query: QueryObject) {
    query.limit = 1
    const rows = await this.get(table, query)
    return rows ? rows[0] : undefined
  }

  static async get(table: string, query: QueryObject) {
    try {
      const { where, limit } = query
      let searchQuery = `SELECT * FROM ${table}`
      const searchValues = []
      if (where) {
        searchQuery = [searchQuery, `WHERE "${where[0]}" = $1`].join(' ')
        searchValues.push(where[1])
      }
      if (limit) {
        searchQuery = [searchQuery, `LIMIT ${limit}`].join(' ')
      }
      const response = await pool.query(searchQuery, searchValues)
      // console.log(33, searchQuery, searchValues, response.rows.length, response.rows.map(r => r.id))
      return response.rows
    } catch (error) {
      console.error(error)
      return
    }
  }

  static async insertUnique(table: string, unique: [string, string], obj: { [key: string]: any }) {
    const exists = await Database.first(table, { where: unique })
    if (exists) return exists
    await this.insert(table, obj)
    return await Database.first(table, { where: unique })
  }

  static async insert(table: string, obj: { [key: string]: any }) {
    try {
      const insertQuery = `INSERT INTO ${table}(${Object.keys(obj).map(v => `"${v}"`).join(', ')}) VALUES(${Object.keys(obj).map((k, i) => `$${i+1}`).join(', ')})`
      const insertValues = Object.keys(obj).map(k => obj[k])
      const response = await pool.query(insertQuery, insertValues)
      return response.rows[0]
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