import * as parse from 'csv-parse'
import Database from './Database'

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

  static async compare(baseline: string, alternative: string) {
    const baselineRecords = await Database.get(this.table, {
      where: ['name', baseline]
    })
    const alternativeRecords = await Database.get(this.table, {
      where: ['name', alternative]
    })
    const results = baselineRecords && alternativeRecords && baselineRecords.map(br => {
      const ar = alternativeRecords.find(ar => ar.geneName === br.geneName)
      return {
        geneName: br.geneName,
        baseline: br.intensity,
        score: ar && ar.intensity && (ar.intensity / br.intensity)
      }
    })
    return { results, baselineRecords, alternativeRecords }
  }
}
