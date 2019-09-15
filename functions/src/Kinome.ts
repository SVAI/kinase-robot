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
  // columns: string[] = ['moleculeLincsId', 'moleculeName', 'proteinLincsId', 'proteinName', 'score', 'concentration', 'contentrationUnit']
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

  static async compare(baseline: string, alternatives: string[]) {
    const baselineRecords: KinomeRecord[] | undefined = await Database.get(this.table, {
      where: ['name', baseline]
    })
    const alternativeScores: { [key: string]: (number | undefined)[] } = {}
    await Promise.all(alternatives.map(async (alternative) => {
      const alternativeRecords: KinomeRecord[] = await Database.get(this.table, {
        where: ['name', alternative]
      }) || []
      alternativeRecords.forEach(ar => {
        alternativeScores[ar.geneName] = alternativeScores[ar.geneName] || []
        alternativeScores[ar.geneName].push(ar.intensity)
      })
    }))
    const results = baselineRecords && baselineRecords.map(br => {
      const alternativeIntensities = alternativeScores[br.geneName]//.filter(notUndefined)
      const alternativeAverage = average(alternativeIntensities.filter(notUndefined))
      return {
        geneName: br.geneName,
        baseline: br.intensity,
        alternativeNames: alternatives,
        alternativeIntensities,
        alternativeAverage,
        score: br.intensity && alternativeAverage ? (alternativeAverage / br.intensity) : null
      }
    })
    return { results }
  }
}
