# kinase-robot

# GoodDocData -- A Template for Simple and Clear Documentation of Hackathon Analyses!

*adapted from [NCBI-Hackathons/GoodDoc](https://github.com/NCBI-Hackathons/GoodDoc) with some tweaks for analysis-driven projects*

*instructions in italics can be deleted as sections are filled in*

*most fields are optional, Conclusion and Important Resources are required*

## Please cite our work -- here is the ICMJE Standard Citation:

### ...and a link to the DOI: *You can make a free DOI with zenodo, synapse, figshare, or other resources <link>*

## Awesome Logo *(if applicable)*

## Website *(if applicable)*

## Abstract *: Summarize everything in a few sentences.* 

## Introduction *: What's the problem? Why should we solve it?*

## Methods *: How did we go about solving it?*

## Results *: What did we observe? Figures are great!*

## Conclusion/Discussion: 

### Please make sure you address ALL of the following:

#### *1. What additional data would you like to have*

- Additional kinome data from all drugs and compounds in the world
- Toxicity data based on kinases inhibited
- Pathway interactions from kinases to others, up and down regulating (Kegg?)
- More Kinome screening data from the tumors we're trying to identify drugs for (to cancel out error rates)

#### *2. What are the next rational steps?* 

- Adding to the pipeline
- Implementing multiple pipeline components, such as feedback loops from drug screending data (both positive and negative)
- Ability to use Kinase expressions from a single tumor for personalized drug predictions
- Add toxicity predictions
- Add combination therapy predictions
- Add RNA predictions

#### *3. What additional tools or pipelines will be needed for those steps?*

- Toxicity prediction module
- Pathway extentions, to amend the kinase data with downstream regulating factors
- Implement module for feedback loop on durg screening data

#### *4. What skills would additional collaborators ideally have?*

- Math
- Biology, drug screening

## Reproduction: *How to reproduce the findings!*

1. Scrape the Synodos Kinase profiling into database using `loadKinese` function
2. Download all Lincs data using the `downloadLincs` function to local machine
3. Populate kinase inhibition molecule data from Lincs data with function `loadLincs`
4. Use `scoreKinase` function to rank the important kinases for the relevant tumor sample, eg: `baselines=Syn1_SF,Syn2_SF` and `alternatives=Syn5_SF,Syn6_SF,Syn8,Syn10,Syn11`
5. Calculate the best drugs using the `scoreDrugs` function

### Important Resources *: primary data, github repository, Synapse project, dockerfile link etc.*


