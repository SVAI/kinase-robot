import * as functions from 'firebase-functions';
import LincsScan from './LincsScan';
import DrugScreen from './Kinome';
import Tools from './Tools';
import Kinome from './Kinome';

export const downloadLincs = functions.runWith({ timeoutSeconds: 540 }).https.onRequest(async (req, resp) => {
  // http://lincs.hms.harvard.edu/db/datasets/20342/results?search=&output_type=.csv
  // const moleculeId = '20342'
  const moleculeIds = LincsScan.moleculeIds
  console.log('starting downloading molecule data')
  await Tools.asyncForEach(moleculeIds, async (moleculeId: string) => {
    console.log('working on', moleculeId)
    await LincsScan.downloadMolecule(moleculeId)
  })
  console.log('done')
  resp.send({ size: moleculeIds.length })
})

export const loadLincs = functions.https.onRequest(async (req, resp) => {
  // const url = 'http://lincs.hms.harvard.edu/db/datasets/20107/results?search=&output_type=.csv'
  // const data = await lincsScan.fetch()
  const moleculeIds = LincsScan.moleculeIds
  console.log('starting parsing molecule data')
  await Tools.asyncForEach(moleculeIds, async (moleculeId: string) => {
    console.log('working on', moleculeId)
    const data = await LincsScan.parseMolecule(moleculeId)
    await LincsScan.saveMolecule(data)
  })
  // const database = new Database()
  // await database.connect()
  // const data2 = await database.getRows()
  resp.send({})
})

export const loadKinese = functions.https.onRequest(async (req, resp) => {
  const filename = 'Synodos_kinome_baseline_LFQ_data.tsv'
  const csvData: any = await Tools.fetchLocal(filename)
  const data = await DrugScreen.parseCsv(csvData)
  await Promise.all(data.map(async record => await Kinome.insert(record)))
  resp.send({ data })
})

export const scoreKinase = functions.https.onRequest(async (req, resp) => {
  const { query } = req
  const { baseline, alternatives } = query
  // const baseline = 'Syn1_SF'
  // const alternatives = ['Syn8', 'Syn10', 'Syn11']
  if (!baseline || !alternatives) {
    console.error(req)
    resp.send({ error: 'baseline or alternatives missing', query })
    return
  }
  const alternatives2 = alternatives.split(',')
  const data = await Kinome.compare(baseline, alternatives2)
  // const data2 = await lincsScan.parseSync(data)
  // const database = new Database()
  // await database.connect()
  // const data2 = await database.getRows()
  resp.send({ data })
})

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
