'use strict';

import app = require('../server/server');

const Promise = require('bluebird');
const fs = require('fs');
const readFile = Promise.promisify(require('fs')
  .readFile);
const jsonfile = require('jsonfile');
const path = require('path');
import deepcopy = require('deepcopy');
import {camelCase} from 'lodash';
import Papa = require('papaparse');

const chembridgeFile = path.resolve(__dirname, 'migrate', 'chemical', 'Chemical_ChembridgeLibrary.csv');
const chembridgeLibraryId = 2;
const fdaFile = path.resolve(__dirname, 'migrate', 'chemical', 'Chemical_FDALibrary.csv');
const fdaLibraryId = 3;

/**
 * Previously, each library was in its own table
 * Now there are two library tables, one for RNA and one for Chemical
 * They have conceptual mappings to whatever the vendor defined
 */

//New Chemical table looks like:
// compund_id
// library_id
// plate
// well
// compound_library_id
// compound_systematic_name
// compound_common_name
// compound_mw
// compound_formula

// This is what a chembridge row looks like
// Row: [ { chembridgelibrary_id: '9345810',
//   code: 'N1261-1',
//   plate: '0394',
//   col: '04',
//   row: 'H',
//   coordinate: 'H04',
//   amount: '2umol',
//   volume: '200ul',
//   rb: '5',
//   clogP: '3.07',
//   tPSA: '68.29',
//   Hacc: '4',
//   Hdon: '1',
//   LogSW: '-3.84',
//   supplier: 'ChemBridge',
//   formula: 'C13H12N2O3S',
//   mol_weight: '276.32',
//   name: '"ethyl 2-(benzoylamino)-1' } ]

//FDA Row
// { fdalibrary_id: '10101015',
//   molecular_name: 'CINNAMIC ACID',
//   plate: '121212-26',
//   coordinate: 'C04',
//   cas_num: '621-82-9',
//   formula: 'C9H8O2',
//   mol_weight: '148.163',
//   bioactivity: 'fragrance & flavoring agent',
//   source: 'widespread in plants',
//   status: 'experimental',
//   tradename: '',
//   references: '' }

let parseChembridgeFile = function () {
  Papa.parse(fs.createReadStream(chembridgeFile), {
    header: true,
    step: function (results, parser) {
      parser.pause();
      parseChembridgeRow(results.data[0])
        .then((newRow) => {
          console.log(JSON.stringify(newRow));
          parser.resume();
        })
        .catch((error) => {
          process.exit(1);
        })
    }
  });
};

let parseFDAFile = function () {
  Papa.parse(fs.createReadStream(fdaFile), {
    header: true,
    step: function (results, parser) {
      parser.pause();
      parseFDARow(results.data[0])
        .then((newRow) => {
          console.log(JSON.stringify(newRow));
          parser.resume();
        })
        .catch((error) => {
          process.exit(1);
        })
    }
  });
};

let parseFDARow = function (row) {
  return new Promise((resolve, reject) => {
    console.log(row);
    let newLibraryRow = {
      libraryId: fdaLibraryId,
      plate: row.plate.split('-')[1],
      well: row.coordinate,
      compoundMw: row.mol_weight,
      compoundFormula: row.formula,
      compoundSystematicName: row.molecular_name,
      compoundLibraryId: row.fdalibrary_id,
    };
    app.models.ChemicalLibrary
      .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(newLibraryRow)}, newLibraryRow)
      .then((results) => {
        resolve(results[0]);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

let parseChembridgeRow = function (row) {
  return new Promise((resolve, reject) => {
    let newLibraryRow = {
      libraryId: chembridgeLibraryId,
      plate: parseInt(row.plate, 10),
      well: row.coordinate,
      compoundMw: row.mol_weight,
      compoundFormula: row.formula,
      compoundSystematicName: row.name,
      compoundLibraryId: row.chembridgelibrary_id,
    };
    app.models.ChemicalLibrary
      .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(newLibraryRow)}, newLibraryRow)
      .then((results) => {
        resolve(results[0]);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

// parseFDAFile();
parseChembridgeFile();

