export interface KinomePulpItem {
  geneName: string,
  score: number,
}

export default class Pulp {
  static get kinomes(): KinomePulpItem[] {
    return [
      {
        "geneName": "STK33",
        "score": 24.31014585232452
      },
      {
        "geneName": "NUAK1",
        "score": 9.651795733205352
      },
      {
        "geneName": "EPHA4",
        "score": 7.325606827715897
      },
      {
        "geneName": "NUAK2",
        "score": 5.799386986601278
      },
      {
        "geneName": "DMPK",
        "score": 5.289425353423383
      },
      {
        "geneName": "NME4",
        "score": 4.473197879996565
      },
      {
        "geneName": "AURKA",
        "score": 3.62307226500394
      },
      {
        "geneName": "MAP2K3",
        "score": 2.9126897220874626
      },
      {
        "geneName": "MAP2K1",
        "score": 2.7259742218406675
      },
      {
        "geneName": "NEK7",
        "score": 2.708624680952098
      },
      {
        "geneName": "ACVR1B",
        "score": 2.6214316174230885
      },
      {
        "geneName": "STK10",
        "score": 2.514017534300857
      },
      {
        "geneName": "CDK18",
        "score": 2.3979369036362073
      },
      {
        "geneName": "CSNK2A1",
        "score": 2.3932349067720247
      },
      {
        "geneName": "RPS6KA1",
        "score": 2.3801208798055953
      },
      {
        "geneName": "FYN",
        "score": 2.2415457234071723
      },
      {
        "geneName": "SRC",
        "score": 2.192429923227995
      },
      {
        "geneName": "LYN",
        "score": 1.9952030146933957
      },
      {
        "geneName": "CAMKK2",
        "score": 1.9210976860997535
      },
      {
        "geneName": "LIMK1",
        "score": 1.9014589784361313
      }
    ]
  }
}