'use strict';

import app = require('../../../../server/server');

const Promise = require('bluebird');
const fs = require('fs');
const readFile = Promise.promisify(require('fs')
  .readFile);
const jsonfile = require('jsonfile');
const path = require('path');
const migrate = require('./migrate-fda-secondary-plate-plan');
let basePath = '/Users/jillian/Dropbox/projects/NY/chemgen/chemgen-loopback-new/common/workflows/library/chemical/fda/secondary/data';

let platePlanUploadDate = new Date();
//FDA Screen is 3
let libraryId = 3;

//These are actually the secondary plate plans
let secondaryScreens = [
  {
    wellDataFile: `${basePath}/2018-04-02--FDA-Secondary_Plate001.json`,
    assayDate: '2018-03-28',
    platePlanName: `CHEM-FDA-2018-03-28`,
    imageDates: [{
      creationdate: '2018-04-04',
    },
    ],
  },
  //2 separate screens were performed with this platePlan
  {
    wellDataFile: `${basePath}/2018-05-30--FDA_Avocado_Secondary.json`,
    assayDate: '2018-05-30',
    platePlanName: `CHEM-FDA-2018-05-30-Avocado`,
    imageDates: [{
      creationdate: '2018-06-04',
    },
    ],
  },
  // {
  //   wellDataFile: `${basePath}/2018-05-30--FDA_Avocado_Secondary.json`,
  //   assayDate: '2018-06-01',
  //   platePlanName: `CHEM-FDA-2018-06-10-Avocado`,
  //   imageDates: [{
  //     creationdate: '2018-06-10',
  //   },
  //   ],
  // },
  {
    wellDataFile: `${basePath}/2018-03-01--Secondary.json`,
    assayDate: '2018-02-28',
    platePlanName: `CHEM-FDA-2018-02-28`,
    imageDates: [{
      creationdate: '2018-03-07',
    },
    ],
  },
  {
    wellDataFile: `${basePath}/2018-02-01-FDA-Secondary_Plate001.json`,
    assayDate: '2018-02-01',
    platePlanName: `CHEM-FDA-2018-02-01`,
    imageDates: [{
      creationdate: '2018-02-07',
    },
    ],
  },
  //3 Separate screens were performed with this platePlan - 18.5,   20, 25C
  {
    wellDataFile: `${basePath}/2017-12-14--FDA--Secondary_Plate001.json`,
    assayDate: '2017-12-14',
    platePlanName: `CHEM-FDA-2017-12-14`,
    imageDates: [{
      creationdate: '2017-12-19',
    },
    ],
  },
  {
    wellDataFile: `${basePath}/2017-11-09--FDA--Secondary_Plate001.json`,
    assayDate: '2017-11-09',
    platePlanName: `CHEM-FDA-2017-11-09`,
    imageDates: [{
      creationdate: '2017-11-16',
    },
    ],
  },
  {
    wellDataFile: `${basePath}/2017-09-24--FDA--Secondary_Plate001_001.json`,
    assayDate: '2017-09-23',
    platePlanName: `CHEM-FDA-2017-09-23`,
    imageDates: [{
      creationdate: '2017-10-04',
    },
    ],
  },
];

createPlatePlans(secondaryScreens);

function createPlatePlans(secondaryScreens) {
  return new Promise((resolve, reject) => {
    Promise.map(secondaryScreens, (secondaryScreen) => {
      console.log(`Mapping secondary screen: ${secondaryScreen.platePlanName}`);
      const wellData = jsonfile.readFileSync(secondaryScreen.wellDataFile);
      let workflowData = {
        platePlanName: secondaryScreen.platePlanName,
        wellData: wellData,
        data: {library: {wellData: wellData}},
      };
      console.log('should be doing stuff');
      return migrate.getParentLibrary(workflowData)
        .then((results) => {
          results.platePlanUploadDate = new Date();
          results.platePlanName = secondaryScreen.platePlanName;
          results.libraryId = 3;
          jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'secondary', 'fda', `${secondaryScreen.platePlanName}.json`), results, {spaces: 2});
          return app.models.PlatePlan96.findOrCreate({where: {platePlanName: results.platePlanName}}, results);
          // return results;
        });
    }, {concurrency: 1})
      .then((results) => {
        // console.log(JSON.stringify(results));
        // return app.models.PlatePlan96.create(results);
        process.exit(0);
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        process.exit(0);
      });
  });
}
