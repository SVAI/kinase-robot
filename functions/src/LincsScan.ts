import * as parse from 'csv-parse'

export interface LincsRecord {
  moleculeLincsId: string,
  moleculeName: string,
  proteinLincsId: string,
  proteinName: string,
  score: number,
  concentration: number,
  contentrationUnit: string,
}

export default class LincsScan {
  columns: string[] = ['moleculeLincsId', 'moleculeName', 'proteinLincsId', 'proteinName', 'score', 'concentration', 'contentrationUnit']

  async parseSync(data: string): Promise<LincsRecord[]> {
    return await new Promise((resolve, reject) => {
      parse(data, {
        from: 2,
        columns: this.columns,
      }, (err, output: { [key: string]: string }[]) => {
        const output2 = output.map(record => {
          const record2: LincsRecord = {
            moleculeLincsId: record.moleculeLincsId,
            moleculeName: record.moleculeName,
            proteinLincsId: record.proteinLincsId,
            proteinName: record.proteinName,
            score: parseFloat(record.score),
            concentration: parseFloat(record.concentration),
            contentrationUnit: record.contentrationUnit,
          }
          return record2
        })
        resolve(output2)
      })
      // STREAMING
      // const parser = parse({})
      // const output: any[] = []
      // parser.on('readable', () => {
      //   const record = parser.read()
      //   output.push(record)
      //   console.log(22, record)
      // })
      // parser.on('error', (error) => {
      //   console.log(error)
      //   reject(error)
      // })
      // parser.on('end', () => {
      //   // console.log(44, 'end')
      //   resolve(output)
      // })
      // console.log(data.split('\n').length)
      // data.split('\n').forEach(line => parser.write(line))
      // // parser.write(data)
      // parser.end()
    })
  }
}
