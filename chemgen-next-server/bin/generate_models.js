'use strict'

const path = require('path')
const Promise = require('bluebird')
const writeFile = Promise.promisify(require('fs').writeFile)
const app = require('../server/server')
const mkdirp = require('mkdirp-promise')
const camelCase = require('camelcase')
const upperCamelCase = require('uppercamelcase')
const fs = require('fs')
const lodash = require('lodash')
const pluralize = require('pluralize')

const datasource = app.dataSources.chemgenDS
console.log(`DataSources: ${Object.keys(app.dataSources)}`);

const modelConfig = require('../server/model-config.json')

const modelDir = path.resolve(__dirname, '..', 'common', 'models')

const ModelsData = {}

datasource.discoverModelDefinitions()
  .then((models) => {
    console.log('should get model definitions');
    return createModels(models)
  })
  .then(() => {
    return addManytoMany()
  })
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.log(`discoverModel: ${error}`);
    process.exit(1)
  })

function addManytoMany () {

  return new Promise((resolve, reject) => {
    // Object.keys(ModelsData).map((modelName) => {
    //   Object.keys(ModelsData[modelName].relations).map((relation) => {
    //     let foreignTable = ModelsData[modelName].relations[relation].model
    //     let relationName = lodash.lowerFirst(String(modelName));
    //     relationName = pluralize(relationName);
    //     let relationObj = {
    //       type: 'hasMany',
    //       model: modelName,
    //       foreignKey: ModelsData[modelName].relations[relation].primaryKey,
    //       primaryKey: ModelsData[modelName].relations[relation].foreignKey,
    //     }
    //     ModelsData[foreignTable].relations[relationName] = relationObj;
    //   })
    // })

    Promise.map(Object.keys(ModelsData), (modelName) => {
      return writeModelFile(ModelsData[modelName])
    })
      .then(() => {
        resolve()
      })
      .catch((error) => {
        console.log(`addManytoMany ${error}`)
        reject(new Error(error))
      })
  })
}

function createModels (models) {
  return new Promise((resolve, reject) => Promise.map(models, model => datasource.discoverSchema(model.name)
    .then((results) => {
      const table = model.name
      console.log(`Creating Model for : ${table}`)
      return getForiegnKeys(datasource, model, results)
      // const outputFile = path.resolve(outputDir, `${table}.json`)
      // const fileContents = JSON.stringify(results, null, 2)
    })
  )
    .then(() => {
      resolve()
    })
    .catch((error) => {
      console.log(`CreateModels ${error}`)
      reject(new Error(error))
    }))
}

function getForiegnKeys (datasource, model, modelData) {
  return new Promise((resolve, reject) => {
    datasource.discoverForeignKeys(model.name)
      .then((fKeyData) => {
        return addForiegnKeys(model, modelData, fKeyData)
        // const outputFile = path.resolve(outputDir, `${model.name}-relations.json`)
        // const fileContents = JSON.stringify(fKeyData, null, 2)
      })
      .then((modelDataWithKeys) => {
        return checkForId(modelDataWithKeys)
      })
      .then((modelDataWithKeys) => {
        ModelsData[modelDataWithKeys.name] = modelDataWithKeys
        resolve()
        // return writeModelFile(modelDataWithKeys)
      })
      .catch((error) => {
        console.error(`getForeignKeys: ${error}`)
        reject(new Error(error))
      })
  })
}

// TODO This only adds hasMany, not belongsTo
function addForiegnKeys (model, modelData, fKeyData) {
  return new Promise((resolve, reject) => {
    let relations = {}
    fKeyData.map(data => {
      let relationName = String(camelCase(data.pkTableName))
      let modelName = upperCamelCase(data.pkTableName)
      relations[pluralize(relationName)] = {
        type: 'hasMany',
        model: modelName,
        foreignKey: camelCase(data.fkColumnName),
        primaryKey: camelCase(data.pkColumnName)
      }
    })
    modelData.relations = relations
    resolve(modelData)
  })
}

// This is some very specific logic that accounts for the fact that all of our ids are autoincrements
function checkForId (modelData) {
  return new Promise((resolve) => {
    Object.keys(modelData.properties).map(function (property) {
      if (modelData.properties[property].hasOwnProperty('id')) {
        if (modelData.properties[property].id === 1) {
          modelData.properties[property].required = false
        }
      }
    })
    resolve(modelData)
  })
}

function writeModelFile (modelData) {
  return new Promise((resolve, reject) => {
    const modelPath = path.resolve(modelDir, modelData.name, 'def')
    path.join('..', 'common', 'models', modelData.name, 'defs')
    modelConfig['_meta']['sources'].push(modelPath)
    modelConfig[modelData.name] = {'datasource': 'chemgenDS', 'public': true}
    mkdirp(modelPath)
      .then(() => {
        const fileContents = JSON.stringify(modelData, null, 2)
        let filePath = path.resolve(modelPath, `${modelData.name}.json`)
        // if (!fs.existsSync(filePath)) {
        writeFile(path.resolve(modelPath, `${modelData.name}.json`), fileContents)
          .then(() => {
            resolve()
          })
          .catch((error) => {
            console.log(`Write Model File: ${error}`)
            reject(new Error(error))
          })
        // } else {
        //   resolve()
        // }
      })
  })
}
