#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
var axios = require('axios');
var Promise = require("bluebird");
var index_1 = require("../common/types/sdk/models/index");
var lodash_1 = require("lodash");
var lodash_2 = require("lodash");
var glob = require("glob-promise");
var Papa = require("papaparse");
var fs = require('fs');
var search = {};
countExpPlates()
    .then(function (paginationResults) {
    return getPagedExpPlates(paginationResults);
})
    .then(function () {
    console.log('finished!');
    process.exit(0);
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
function getPagedExpPlates(paginationResults) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(paginationResults.pages, function (page) {
            var skip = Number(page) * Number(paginationResults.limit);
            console.log("Page: " + page + " Skip: " + skip);
            var data = {};
            return app.models.ExpPlate
                .find({
                limit: paginationResults.limit,
                skip: skip,
                where: search,
            })
                .then(function (results) {
                data['expPlates'] = results;
                return app.models.ExpAssay
                    .find({
                    where: {
                        plateId: {
                            inq: results.map(function (expPlate) {
                                return expPlate.plateId;
                            })
                        }
                    },
                });
            }, { concurrency: 1 })
                .then(function (expPlates) {
                //@ts-ignore
                return Promise.map(expPlates, function (expPlate) {
                    return getCountsApi(expPlate);
                });
            })
                .then(function () {
                return;
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function getCountsApi(expPlate) {
    return new Promise(function (resolve, reject) {
        var imagePath = "/mnt/image/" + expPlate.plateImagePath;
        var counts = [
            "/mnt/image/" + expPlate.plateImagePath + "/" + expPlate.instrumentPlateId + "-tf-counts.csv",
            "/mnt/image/" + expPlate.plateImagePath + "/" + expPlate.instrumentPlateId + "-tfcounts.csv",
            "/mnt/image/" + expPlate.plateImagePath + "/" + expPlate.instrumentPlateId + "-tf_counts.csv",
        ];
        //@ts-ignore
        Promise.map(counts, function (countsFile) {
            return axios.post('http://pyrite.abudhabi.nyu.edu:3005/tf_counts/1.0/api/get_counts', {
                image_path: imagePath,
                counts: countsFile,
            })
                .then(function (results) {
                // console.log(contactSheetResults.data);
                return getAssays(results.data.counts);
                // return;
            })
                .then(function () {
                return;
            })
                .catch(function (error) {
                //TODO The TF API throws an internal service error instead of just an empty result - which is stupid
                return;
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getAssays(counts) {
    return new Promise(function (resolve, reject) {
        var or = [];
        counts.map(function (count) {
            var imagePath = count.image_path;
            imagePath = imagePath.replace('/mnt/image/', '');
            imagePath = imagePath.replace('-autolevel.bmp', '');
            imagePath = imagePath.replace('-autolevel.png', '');
            count.imagePathModified = imagePath;
            or.push({ assayImagePath: count.imagePathModified });
        });
        app.models.ModelPredictedCounts
            .find({
            where: {
                assayImagePath: {
                    inq: counts.map(function (count) {
                        return count.imagePathModified;
                    })
                }
            }
        })
            .then(function (countsInDb) {
            if (lodash_1.isEqual(countsInDb.length, counts.length)) {
                resolve();
            }
            else {
                app.models.ExpAssay
                    .find({ where: { or: or } })
                    .then(function (results) {
                    return assignCountsToAssay(results, counts);
                })
                    .then(function () {
                    resolve();
                })
                    .catch(function (error) {
                    console.log(error);
                    reject(new Error(error));
                });
            }
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
// TODO Add all this math to the tf_counts get_counts api
function assignCountsToAssay(assays, counts) {
    // console.log('In assignCountsToAssay');
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(assays, function (assay) {
            var countRow = lodash_1.find(counts, function (count) {
                if (!lodash_1.isNull(count) && !lodash_1.isUndefined(count)) {
                    return lodash_1.isEqual(String(count.imagePathModified), String(assay.assayImagePath));
                }
            });
            // console.log(JSON.stringify(countRow));
            // Lethality as [ embryos / (embryos + larvae) ] ]
            // let percEmbLeth = 0;
            if (lodash_1.isNull(countRow) || lodash_1.isUndefined(countRow)) {
                return {};
            }
            else {
                // let percEmbLeth = 0;
                var percEmbLeth_1 = lodash_2.divide(Number(countRow.egg), lodash_2.add(Number(countRow.egg), Number(countRow.larva)));
                //Do not know why this wasn't caught by isNan
                if (!lodash_1.isFinite(percEmbLeth_1) || lodash_1.isNull(percEmbLeth_1) || lodash_1.isUndefined(percEmbLeth_1) || lodash_1.isNaN(percEmbLeth_1)) {
                    percEmbLeth_1 = 0;
                }
                percEmbLeth_1 = percEmbLeth_1 * 100;
                percEmbLeth_1 = lodash_2.round(percEmbLeth_1, 4);
                // larvae / ( embryos + larvae)
                // let percSter = 0;
                var percSter_1 = lodash_2.divide(Number(countRow.larva), lodash_2.add(Number(countRow.egg), Number(countRow.larva)));
                if (!lodash_1.isFinite(percSter_1) || lodash_1.isNull(percSter_1) || lodash_1.isUndefined(percSter_1) || lodash_1.isNaN(percSter_1)) {
                    percSter_1 = 0;
                }
                percSter_1 = percSter_1 * 100;
                percSter_1 = lodash_2.round(percSter_1, 4);
                // Brood size is calculated as [ (embryos + larvae) / worm ].
                var broodSize_1 = lodash_2.divide(Number(countRow.larva), (lodash_2.add(Number(countRow.egg), Number(countRow.worm))));
                if (!lodash_1.isFinite(broodSize_1) || lodash_1.isNull(broodSize_1) || lodash_1.isUndefined(broodSize_1) || lodash_1.isNaN(broodSize_1)) {
                    broodSize_1 = 0;
                }
                broodSize_1 = lodash_2.round(broodSize_1, 4);
                var newCounts = new index_1.ModelPredictedCountsResultSet({
                    modelId: 3,
                    assayId: assay.assayId,
                    screenId: assay.screenId,
                    plateId: assay.plateId,
                    expGroupId: assay.expGroupId,
                    assayImagePath: assay.assayImagePath,
                    wormCount: countRow.worm,
                    larvaCount: countRow.larva,
                    eggCount: countRow.egg,
                    percEmbLeth: percEmbLeth_1,
                    percSter: percSter_1,
                    broodSize: broodSize_1
                });
                // console.log(JSON.stringify(newCounts));
                //Using the entire findOrCreate Object did not work - possibly because of rhe percEmbLeth?
                // let findOrCreate = app.etlWorkflow.helpers.findOrCreateObj(newCounts);
                // console.log(`FindOrCreate: ${JSON.stringify(findOrCreate)}`);
                return app.models.ModelPredictedCounts
                    .findOrCreate({
                    where: {
                        and: [
                            { assayId: newCounts.assayId },
                            { modelId: newCounts.modelId }
                        ]
                    }
                }, newCounts)
                    .then(function (results) {
                    results[0].broodSize = broodSize_1;
                    results[0].percSter = percSter_1;
                    results[0].percEmbLeth = percEmbLeth_1;
                    var modelPredictedCount = results[0];
                    return app.models.ExpGroup
                        .findOne({ where: { expGroupId: assay.expGroupId } })
                        .then(function (expGroup) {
                        // app.winston.info(`Old Counts: ${JSON.stringify(modelPredictedCount)}`);
                        modelPredictedCount.expWorkflowId = assay.expWorkflowId;
                        modelPredictedCount.expGroupId = assay.expGroupId;
                        modelPredictedCount.expGroupType = expGroup.expGroupType;
                        if (assay.expGroupId) {
                            return app.models.ExpDesign.extract.workflows
                                .getExpSets([{ expGroupId: assay.expGroupId }])
                                .then(function (results) {
                                if (!lodash_1.isEqual(modelPredictedCount.expGroupType, 'ctrl_null') && !lodash_1.isEqual(modelPredictedCount.expGroupType, 'ctrl_strain')) {
                                    modelPredictedCount.treatmentGroupId = results.expDesigns[0][0].treatmentGroupId;
                                }
                                // app.winston.info(`New Counts: ${JSON.stringify(modelPredictedCount)}`);
                                return app.models.ModelPredictedCounts.upsert(modelPredictedCount);
                            })
                                .then(function () {
                                return;
                            })
                                .catch(function (error) {
                                app.winston.error(error);
                                reject(new Error(error));
                            });
                        }
                        else {
                            // app.winston.info(`New Counts: ${JSON.stringify(modelPredictedCount)}`);
                            return app.models.ModelPredictedCounts
                                .upsert(modelPredictedCount);
                        }
                    })
                        .catch(function (error) {
                        return new Error(error);
                    });
                })
                    .then(function () {
                    return {};
                })
                    .catch(function (error) {
                    console.log(JSON.stringify(error));
                    return new Error(error);
                });
            }
        }, { concurrency: 1 })
            .then(function () {
            console.log('Complete');
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
/**
 *
 * Deprecated - Old script got counts file directly from the file system
 * Now we use the get_counts api from the flask in chemgen-next-analysis-docker/counts/tf_counts
 *
 */
// This MUSt be run from a server with access to the file system
// Head of tfcounts files looks like:
// egg,egg_clump,image_path,larva,worm
// 30,1,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A01-autolevel.bmp,94,3
// 5,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A02-autolevel.bmp,80,12
// 4,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A03-autolevel.bmp,99,4
// let globPatterns = [
//   "/mnt/image/2016*/*/*tf*.csv",
//   "/mnt/image/2017*/*/*tf*.csv",
//   "/mnt/image/2018*/*/*tf*.csv",
//   "/mnt/image/2014*/*/*tf*.csv",
//   "/mnt/image/2015*/*/*tf*.csv",
// ];
//
// globPatterns = shuffle(globPatterns);
//
// globAllTheThings(globPatterns)
//   .then(() => {
//     console.log('Finished no errors!');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.log('Finished with errors!');
//     console.log(error);
//     process.exit(1);
//   });
function globAllTheThings(globs) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(globs, function (globPattern) {
            console.log("Glob Pattern: " + globPattern);
            return globOneThing(globPattern);
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function globOneThing(globPattern) {
    return new Promise(function (resolve, reject) {
        glob(globPattern)
            .then(function (files) {
            console.log("Processing " + files.length + " counts");
            files = lodash_1.shuffle(files);
            return getCounts(files);
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function getCounts(files) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(files, function (file) {
            console.log("Parsing " + file);
            return parseCountsFile(file);
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function parseCountsFile(countsFile) {
    return new Promise(function (resolve, reject) {
        // let orig = [];
        var data = [];
        Papa.parse(fs.createReadStream(countsFile), {
            header: true,
            step: function (results, parser) {
                parser.pause();
                var imagePath = results.data[0].image_path;
                imagePath = imagePath.replace('/mnt/image/', '');
                imagePath = imagePath.replace('-autolevel.bmp', '');
                imagePath = imagePath.replace('-autolevel.png', '');
                results.data[0].imagePathModified = imagePath;
                // orig.push(contactSheetResults.data[0]);
                data.push(results.data[0]);
                if (data.length >= 10) {
                    getAssays([data])
                        .then(function () {
                        data = [];
                        parser.resume();
                    })
                        .catch(function (error) {
                        console.log(error);
                        parser.abort();
                    });
                }
                else {
                    parser.resume();
                }
            },
            complete: function () {
                if (data.length) {
                    getAssays([data])
                        .then(function () {
                        console.log('Finished parsing file!');
                        resolve();
                    })
                        .catch(function (error) {
                        console.log(error);
                        reject(new Error(error));
                    });
                }
            },
        });
    });
}
function countExpPlates() {
    return new Promise(function (resolve, reject) {
        app.models.ExpPlate
            .count()
            .then(function (count) {
            var limit = 50;
            var numPages = Math.round(count / limit);
            var pages = lodash_1.range(0, numPages + 2);
            pages = lodash_1.shuffle(pages);
            console.log("count is " + count);
            resolve({ count: count, pages: pages, limit: limit });
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=get_tf_counts.js.map