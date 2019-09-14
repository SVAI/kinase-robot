import * as functions from 'firebase-functions';
import axios from 'axios'

class LincsScan {
  constructor(private csvUrl: string) {}

  async fetch() {
    const { data } = await axios.get(this.csvUrl)
    return data
  }
}

export const scrape = functions.https.onRequest(async (req, resp) => {
  const url = 'http://lincs.hms.harvard.edu/db/datasets/20107/results?search=&output_type=.csv'
  const lincsScan = new LincsScan(url)
  const data = await lincsScan.fetch()
  resp.send(data)
})

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
