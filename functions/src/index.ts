import * as functions from 'firebase-functions';
import LincsScan from './LincsScan';

export const scrape = functions.https.onRequest(async (req, resp) => {
  const url = 'http://lincs.hms.harvard.edu/db/datasets/20107/results?search=&output_type=.csv'
  const lincsScan = new LincsScan(url)
  // const data = await lincsScan.fetch()
  const data = await lincsScan.fetchLocal()
  const data2 = await lincsScan.parseSync(data)
  resp.send({ data2 })
})

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
