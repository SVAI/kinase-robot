import * as parse from 'csv-parse'
import Database from './Database'

const average = (arr: number[]) => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined
}

type OutputRecord = Array<string>

interface KinomeRecord {
  name: string,
  geneName: string,
  intensity?: number,
}

export default class Kinome {
  // First column is always the gene
  // constructor() {}
  static table = 'kinase_screen'
  // columns: string[] = ['moleculeLincsId', 'moleculeName', 'proteinLincsId', 'proteinName', 'score', 'concentration', 'concentrationUnit']
  static async parseCsv(data: string): Promise<KinomeRecord[]> {
    return await new Promise((resolve, reject) => {
      parse(data, {
        delimiter: '\t',
      }, (err, records: OutputRecord[]) => {
        const header = records.splice(0, 1)[0]
        const records2: KinomeRecord[] = []
        records.forEach((record, recordIndex) => {
          const geneName = record[0]
          record.forEach((intensity, screenIndex) => {
            // skip column
            if (screenIndex === 0) return
            const screen = header[screenIndex]
            records2.push({
              name: screen,
              geneName,
              intensity: parseFloat(intensity)
            })
          })
        })
        resolve(records2)
      })
    })
  }

  static async insert(record: KinomeRecord) {
    await Database.insert(this.table, record)
  }

  static async compare(baselines: string[], alternatives: string[]) {
    // const baselineRecords: KinomeRecord[] | undefined = await Database.get(this.table, {
    //   where: ['name', baseline]
    // })
    const baselineScores = await this.getScores(baselines)
    const alternativeScores = await this.getScores(alternatives)
    const results = Object.keys(baselineScores).map(geneName => {
      const baselineIntensities = baselineScores[geneName]//.filter(notUndefined)
      const baselineAverage = average(baselineIntensities.filter(notUndefined))
      const alternativeIntensities = alternativeScores[geneName]//.filter(notUndefined)
      const alternativeAverage = average(alternativeIntensities.filter(notUndefined))
      return {
        geneName: geneName,
        baselineNames: baselines,
        baselineIntensities,
        baselineAverage,
        alternativeNames: alternatives,
        alternativeIntensities,
        alternativeAverage,
        score: baselineAverage && alternativeAverage ? (alternativeAverage / baselineAverage) : null
      }
    })
    return { results }
  }

  static async getScores(compounds: string[]) {
    const compoundScores: { [key: string]: (number | undefined)[] } = {}
    await Promise.all(compounds.map(async (compound) => {
      const compoundRecords: KinomeRecord[] = await Database.get(this.table, {
        where: ['name', compound]
      }) || []
      compoundRecords.forEach(ar => {
        compoundScores[ar.geneName] = compoundScores[ar.geneName] || []
        compoundScores[ar.geneName].push(ar.intensity)
      })
    }))
    return compoundScores
  }
}
