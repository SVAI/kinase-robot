import * as functions from 'firebase-functions';
import LincsScan from './LincsScan';
import Database from './Database';
import DrugScreen from './Kinome';
import Tools from './Tools';
import Kinome from './Kinome';

export const scrape = functions.https.onRequest(async (req, resp) => {
  const url = 'http://lincs.hms.harvard.edu/db/datasets/20107/results?search=&output_type=.csv'
  const path = '/dataset_20107_20190914215210.csv'
  const lincsScan = new LincsScan(url)
  // const data = await lincsScan.fetch()
  const data = await Tools.fetchLocal(path)
  const data2 = await lincsScan.parseSync(data)
  // const database = new Database()
  // await database.connect()
  // const data2 = await database.getRows()
  resp.send({ data2 })
})

export const loadScreen = functions.https.onRequest(async (req, resp) => {
  // const url = 'http://lincs.hms.harvard.edu/db/datasets/20107/results?search=&output_type=.csv'
  const filename = 'Synodos_kinome_baseline_LFQ_data.tsv'
  // const data = await lincsScan.fetch()
  const csvData: any = await Tools.fetchLocal(filename)
  const data = await DrugScreen.parseCsv(csvData)
  await Promise.all(data.map(async record => await Kinome.insert(record)))
  // const data2 = await lincsScan.parseSync(data)
  // const database = new Database()
  // await database.connect()
  // const data2 = await database.getRows()
  resp.send({ data })
})

export const readScreen = functions.https.onRequest(async (req, resp) => {
  const baseline = 'Syn1_SF'
  const alternative = 'Syn5_SF'
  const data = await Kinome.compare(baseline, alternative)
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
