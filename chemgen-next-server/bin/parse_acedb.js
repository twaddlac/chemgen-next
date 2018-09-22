#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var app = require('../server/server');
var Promise = require('bluebird');
var jsonfile = require('jsonfile');
var fs = require('fs');
var path = require('path');
var lodash_1 = require("lodash");
var ds = app.datasources.mongoDBWS250;
var RecursiveIterator = require('recursive-iterator');
var parseString = require('xml2js').parseString;
program
    .version('0.1.0')
    .option('-m, --model [value]', 'Model file in xml format. Should have a single model')
    .parse(process.argv);
var model = path.resolve(process.cwd(), program.model);
var xml = fs.readFileSync(model, 'utf-8');
// console.log(xml);
parseThings(xml);
function parseThings(xml) {
    parseString(xml, { mergeAttrs: true, explicitArray: false }, function (err, result) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        else {
            walkDoc(result);
        }
        // console.log(JSON.stringify(result));
        //jsonfile.writeFileSync(`rnai-${random}.json`, result, {spaces: 2});
    });
}
function walkDoc(root) {
    console.log('walking!');
    var iterator = new RecursiveIterator(root);
    for (var item = iterator.next(); !item.done; item = iterator.next()) {
        var state = item.value;
        checkIfIsClass(state);
        // console.log(state.path.join('.'), state.node);
    }
    var topClass = Object.keys(root)[0];
    createInstance(root[topClass])
        .then(function (results) {
        return root[topClass];
    });
}
function createInstance(object) {
    return new Promise(function (resolve, reject) {
        console.log("Creating model for " + object.class);
        var modelInstance = ds.buildModelFromInstance("" + object.class, object, { idInjection: true });
        var obj = new modelInstance(object);
        console.log(modelInstance);
        console.log(JSON.stringify(modelInstance.definition, null, 2));
        var where = {};
        where[lodash_1.lowerCase(object.class) + "Id"] = object.value;
        modelInstance.findOrCreate({ where: where }, obj)
            .then(function (results) {
            console.log(JSON.stringify(results));
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
        // console.log(JSON.stringify(obj));
    });
}
function checkIfIsClass(state) {
    if (!lodash_1.isObject(state.node)) {
        return;
    }
    if (lodash_1.get(state.node, 'value') && lodash_1.get(state.node, 'class')) {
        var stateClass = state.node['class'];
        if (!stateClass.match('#')) {
            var id = lodash_1.lowerCase(stateClass) + "Id";
            state.node[id] = state.node['value'];
        }
    }
}
//# sourceMappingURL=parse_acedb.js.map