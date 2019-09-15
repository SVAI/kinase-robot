import * as functions from 'firebase-functions';
import LincsScan, { KinaseIntensityRecord, MoleculeRecord } from './LincsScan';
import DrugScreen from './Kinome';
import Tools from './Tools';
import Kinome from './Kinome';
import Database from './Database';
import Pulp, { KinomePulpItem } from './Pulp';

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
  const { baselines, alternatives }: { baselines: string, alternatives: string } = query
  // const baseline = 'Syn1_SF'
  // const alternatives = ['Syn8', 'Syn10', 'Syn11']
  if (!baselines || !alternatives) {
    console.error(req)
    resp.send({ error: 'baselines or alternatives missing', query })
    return
  }
  const baselines2 = baselines.split(',')
  const alternatives2 = alternatives.split(',')
  const data = await Kinome.compare(baselines2, alternatives2)
  // const data2 = await lincsScan.parseSync(data)
  // const database = new Database()
  // await database.connect()
  // const data2 = await database.getRows()
  const summary = data.slice(0, 20).map(d => ({ geneName: d.geneName, score: d.score }))
  resp.send({ summary, data })
})

type Score = [number, number, number]

function calculateMoleculeScore(kinase_intensities: KinaseIntensityRecord[], kinomes: KinomePulpItem[]) {
  // let score = 0
  const scores: Score[] = []
  kinomes.forEach(kinome => {
    kinase_intensities.forEach(kinase_intensity => {
      // no intensity data found, skip
      if (!kinase_intensity.proteinName.match(`${kinome.geneName}`)) return
      const s1 = kinase_intensity.score / 100
      const s2 = kinome.score
      const s3 = s1 * s2
      scores.push([s1, s2, s3])
    })
    // const kinomeScore = kinome.score * 2
    // score += kinomeScore
  })
  return scores
}

function clayton(scores: number[]) {
  const sum = scores.reduce((a, b) => a + b, 0.0)
  const norm = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b, 2), 0.0))
  const baseNorm = Math.sqrt(scores.length)
  return sum / (norm * baseNorm)
}


export const scoreDrugs = functions.runWith({ timeoutSeconds: 540 }).https.onRequest(async (req, resp) => {
  // const { query } = req
  const kinomes = Pulp.kinomes
  const moleculeScores: {
    [key: string]: {
      claytonNumber: number,
      scores: Score[],
    }
  } = {}
  const molecules: MoleculeRecord[] = await Database.get('molecules', {}) || []

  await Tools.asyncForEach(molecules, async (molecule: MoleculeRecord) => {
    // iterate over all molecules
    if (!molecule || !molecule.id) return
    const kinase_intensities: KinaseIntensityRecord[] = await Database.get('kinase_intensities', {
      where: ['molecule', molecule.id]
    }) || []
    let kinase_intensities2: KinaseIntensityRecord[] = []
    kinomes.forEach(kinome => {
      kinase_intensities2 = kinase_intensities2.concat(...kinase_intensities.filter(k => {
        return k.proteinName.match(`${kinome.geneName}`)
      }))
    })
    const scores = calculateMoleculeScore(kinase_intensities2, kinomes)
    const scores2 = scores.map(s => s[2])
    const claytonNumber = clayton(scores2)
    moleculeScores[molecule.name] = { scores, claytonNumber }
  })

  const moleculeScores2: any = Object.keys(moleculeScores)
    .sort((a, b) => moleculeScores[b].claytonNumber - moleculeScores[a].claytonNumber)
    .map(k => {
      const moleculeScore = moleculeScores[k]
      return { molecule: k, final: moleculeScore.claytonNumber }
    })
  // moleculeScores[molecule.]
  // console.log(33, molecule)
  // console.log(33, kinase_intensities)
  // const data2 = await lincsScan.parseSync(data)
  // const database = new Database()
  // await database.connect()
  // const data2 = await database.getRows()
  resp.send({ moleculeScores2, moleculeScores, kinomes })
})



// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
