import * as parse from 'csv-parse'
import Tools from './Tools'
import Database from './Database'

export interface LincsFetch {
  moleculeLincsId: string,
  moleculeName: string,
  proteinLincsId: string,
  proteinName: string,
  score: number,
  concentration: number,
  concentrationUnit: string,
}

export interface MoleculeRecord {
  id?: number,
  name: string,
  lincsId: string,
}

export interface ProteinRecord {
  id?: number,
  name: string,
  lincsId: string,
}


export interface KinaseIntensityRecord {
  id?: number,
  score: number,
  protein: number,
  proteinName: string,
  molecule: number,
  concentration: number,
  concentrationUnit: string,
}

export default class LincsScan {
  static columns: string[] = ['moleculeLincsId', 'moleculeName', 'proteinLincsId', 'proteinName', 'score', 'concentration', 'concentrationUnit']

  static getMoleculePath(moleculeLincsId: string) {
    const filename = [moleculeLincsId, 'csv'].join(".")
    const group = 'lincs/molecule'
    const path = [__dirname, group, filename].join('/')
    return { path, group, filename }
  }

  static async downloadMolecule(moleculeLincsId: string) {
    const { path, group, filename } = this.getMoleculePath(moleculeLincsId)
    if (Tools.fileExists(path)) return
    const url = `https://lincs.hms.harvard.edu/db/datasets/${moleculeLincsId}/results?search=&output_type=.csv`
    const data = await Tools.fetchRemote(url)
    await Tools.writeLocal(group, filename, data)
  }

  static async parseMolecule(moleculeLincsId: string): Promise<LincsFetch[]> {
    const { path } = LincsScan.getMoleculePath(moleculeLincsId)
    const data = await Tools.fetchLocal(path)
    const data2 = await this.parseSync(data)
    return data2
  }

  // "moleculeLincsId": "10350-101-1",
  // "moleculeName": "(s)-CR8",
  // "proteinLincsId": "200001",
  // "proteinName": "AAK1",
  // "score": 94,
  // "concentration": 10000,
  // "concentrationUnit": "nM"
  static async saveMolecule(data: LincsFetch[]) {
    await Tools.asyncForEach(data, async (lincs: LincsFetch) => {
      console.log('parsing lincs', lincs.moleculeLincsId)
      const molecule: MoleculeRecord = {
        name: lincs.moleculeName,
        lincsId: lincs.moleculeLincsId,
      }
      const protein: ProteinRecord = {
        name: lincs.proteinName,
        lincsId: lincs.proteinLincsId,
      }
      const { id: moleculeId } = await Database.insertUnique(
        'molecules',
        ['lincsId', lincs.moleculeLincsId],
        molecule,
      )
      const { id: proteinId } = await Database.insertUnique(
        'proteins',
        ['lincsId', lincs.proteinLincsId],
        protein,
      )
      const kinaseIntensity: KinaseIntensityRecord = {
        score: lincs.score,
        protein: proteinId,
        proteinName: lincs.proteinName,
        molecule: moleculeId,
        concentration: lincs.concentration,
        concentrationUnit: lincs.concentrationUnit,
      }
      await Database.insert(
        'kinase_intensities',
        kinaseIntensity
      )
      // console.log(77, proteinId, moleculeId)
    })
  }

  static async parseSync(data: string): Promise<LincsFetch[]> {
    return await new Promise((resolve, reject) => {
      parse(data, {
        from: 2,
        columns: this.columns,
        // TODO CHECK THIS
        skip_lines_with_error: true,
      }, (err, output: { [key: string]: string }[]) => {
        if (!output) {
          console.error('no ouput for data', data)
          return
        }
        const output2 = output.map(record => {
          const record2: LincsFetch = {
            moleculeLincsId: record.moleculeLincsId,
            moleculeName: record.moleculeName,
            proteinLincsId: record.proteinLincsId,
            proteinName: record.proteinName,
            score: parseFloat(record.score),
            concentration: parseFloat(record.concentration),
            concentrationUnit: record.concentrationUnit,
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

  static get moleculeIds() {
    return ['20342','20211','20059','20338','20147','20172','20086','20263','20193','20049','20050','20341','20035','20191','20025','20135','20038','20129','20027','20043','20158','20227','20224','20057','20149','20327','20112','20034','20146','20332','20116','20184','20180','20127','20262','20037','20118','20164','20329','20114','20054','20203','20326','20028','20029','20033','20200','20131','20096','20196','20128','20151','20168','20159','20337','20160','20174','20176','20181','20161','20169','20085','20190','20030','20031','20194','20022','20032','20134','20133','20051','20052','20021','20132','20222','20198','20048','20335','20081','20212','20108','20046','20183','20225','20113','20119','20058','20041','20117','20185','20107','20155','20189','20182','20170','20042','20157','20082','20150','20221','20228','20053','20195','20331','20162','20175','20061','20040','20109','20199','20084','20130','20044','20339','20163','20080','20055','20153','20166','20126','20125','20167','20060','20152','20261','20187','20024','20154','20062','20063','20340','20110','20148','20201','20330','20202','20173','20177','20023','20333','20124','20156','20165','20083','20171','20020','20192','20111','20179','20039','20264','20223','20045','20334','20188','20064','20065','20328','20197','20186','20026','20178','20036','20056','20079','20066','20067','20068','20069','20336','20115','20070','20071','20072','20073','20074','20075','20076','20077','20078','20047','20220']
    // return ['20342','20211','20059']
  }
}
