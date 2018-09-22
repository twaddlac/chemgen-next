#!/usr/bin/env node

const program = require('commander');
const app = require('../server/server');
const Promise = require('bluebird');
const jsonfile = require('jsonfile');
const fs = require('fs');
const path = require('path');
import {isArray, lowerCase, isObject, get} from 'lodash';

const ds = app.datasources.mongoDBWS250;

const RecursiveIterator = require('recursive-iterator');
const parseString = require('xml2js').parseString;

program
  .version('0.1.0')
  .option('-m, --model [value]', 'Model file in xml format. Should have a single model')
  .parse(process.argv);

let model = path.resolve(process.cwd(), program.model);
const xml = fs.readFileSync(model, 'utf-8');
// console.log(xml);

parseThings(xml);

function parseThings(xml) {
  parseString(xml, {mergeAttrs: true, explicitArray: false}, function (err, result) {
    if (err) {
      console.log(err);
      process.exit(1);
    } else {
      walkDoc(result);
    }
    // console.log(JSON.stringify(result));
    //jsonfile.writeFileSync(`rnai-${random}.json`, result, {spaces: 2});
  });
}

function walkDoc(root) {
  console.log('walking!');
  let iterator = new RecursiveIterator(root);
  for (let item = iterator.next(); !item.done; item = iterator.next()) {
    let state = item.value;
    checkIfIsClass(state);
    // console.log(state.path.join('.'), state.node);
  }
  let topClass = Object.keys(root)[0];
  createInstance(root[topClass])
    .then((results) =>{
      return root[topClass];
    });
}

function createInstance(object) {
  return new Promise((resolve, reject) => {
    console.log(`Creating model for ${object.class}`);
    let modelInstance = ds.buildModelFromInstance(`${object.class}`, object, {idInjection: true});
    let obj = new modelInstance(object);
    console.log(modelInstance);
    console.log(JSON.stringify(modelInstance.definition, null, 2));
    let where = {};
    where[`${lowerCase(object.class)}Id`] = object.value;
    modelInstance.findOrCreate({where: where}, obj)
      .then((results) =>{
        console.log(JSON.stringify(results));
        resolve();
      })
      .catch((error) =>{
        reject(new Error(error));
      });
    // console.log(JSON.stringify(obj));
  });
}

function checkIfIsClass(state) {
  if (!isObject(state.node)) {
    return;
  }
  if (get(state.node, 'value') && get(state.node, 'class')) {
    let stateClass = state.node['class'];
    if (!stateClass.match('#')) {
      let id = `${lowerCase(stateClass)}Id`;
      state.node[id] = state.node['value'];
    }
  }
}
