"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var types_1 = require("../../types");
var config = require("config");
var knex = config.get('knex');
var redis = require("redis");
// @ts-ignore
Promise.promisifyAll(redis);
var redisClient = redis.createClient(config.get('redisUrl'));
var ExpSet = app.models.ExpSet;
/**
 * Grab ExpSets that do not have a manual score and organize by plate
 * This one is a little different from the other ExpSet function, which assume that the user wants to see all the replicates together
 * Instead the user independently scores each plate
 * So we can just use the expWorkflowId to do all the lookups
 * This is not same as the others - where we may be searching for a gene/chemical across all the screens
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByPlate = function (search) {
    return new Promise(function (resolve, reject) {
        console.log("Before: " + JSON.stringify(search));
        search = new types_1.ExpSetSearch(search);
        var data = new types_1.ExpSetSearchResults({});
        console.log("After: " + JSON.stringify(search));
        var sqlQuery = ExpSet.extract.buildNativeQuery(data, search, false);
        sqlQuery = sqlQuery.count();
        data.pageSize = 1;
        ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
            .then(function (data) {
            return ExpSet.extract.workflows.getExpAssay2reagentsByScores(data, search, false);
        })
            .then(function (data) {
            return ExpSet.extract.fetchFromCache(data, search);
        })
            .then(function (data) {
            // Check to see if it was fetched from the cache
            if (!data.fetchedFromCache) {
                return ExpSet.extract.getExpDataByExpWorkflowId(data, search);
            }
            else {
                return data;
            }
        })
            .then(function (data) {
            //ExpManualScores and ModelPredictedCounts do NOT go in the cache
            return ExpSet.extract.getExpManualScoresByExpWorkflowId(data, search);
        })
            .then(function (data) {
            // TODO Could probably cache the counts,
            // just have to make sure there is one count record per AssayId
            return ExpSet.extract.getModelPredictedCountsByExpWorkflowId(data, search);
        })
            .then(function (data) {
            data = ExpSet.extract.insertCountsDataImageMeta(data);
            data = ExpSet.extract.insertExpManualScoresImageMeta(data);
            data = ExpSet.extract.genAlbumsByPlate(data, search);
            data = ExpSet.extract.cleanUp(data, search);
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getModelPredictedCountsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ModelPredictedCounts
            .find({
            where: {
                expWorkflowId: data.expWorkflows[0].id,
            }
        })
            .then(function (modelPredictedCounts) {
            data.modelPredictedCounts = modelPredictedCounts;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getExpManualScoresByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpManualScores
            .find({
            where: {
                expWorkflowId: data.expWorkflows[0].id,
            }
        })
            .then(function (expManualScores) {
            data.expManualScores = expManualScores;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getExpAssay2reagentsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpAssay2reagent
            .find({
            where: {
                and: [{ expWorkflowId: data.expAssay2reagents[0].expWorkflowId },
                    { reagentId: { neq: null } },
                ]
            },
            fields: {
                treatmentGroupId: true,
                assay2reagentId: true,
                expGroupId: true,
                plateId: true,
                assayId: true,
                reagentId: true,
                libraryId: true,
                reagentType: true,
            },
        })
            .then(function (expAssay2reagents) {
            var groups = lodash_1.groupBy(expAssay2reagents, 'reagent_type');
            ['ctrl_null', 'ctrl_strain'].map(function (expGroupType) {
                groups[expGroupType] = lodash_1.shuffle(groups[expGroupType]);
                groups[expGroupType] = groups[expGroupType].slice(0, search.ctrlLimit);
            });
            Object.keys(groups).map(function (expGroupType) {
                groups[expGroupType].map(function (expAssay2reagent) {
                    data.expAssay2reagents.push(expAssay2reagent);
                });
            });
            return data;
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * This is the main workflow to get the Data
 * It includes ExpPlates, ExpScreens, ExpScreenWorkflows
 * Counts and Scores are separate
 * @param data
 * @param search
 */
ExpSet.extract.getExpDataByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpAssay2reagent
            .find({
            where: {
                and: [{ expWorkflowId: data.expAssay2reagents[0].expWorkflowId },
                    { expGroupId: { neq: null } },
                ]
            },
            fields: {
                treatmentGroupId: true,
                assay2reagentId: true,
                expGroupId: true,
                plateId: true,
                assayId: true,
                reagentId: true,
                libraryId: true,
                reagentType: true,
            },
        })
            .then(function (expAssay2reagents) {
            data.expAssay2reagents = expAssay2reagents;
            return data;
        })
            .then(function (data) {
            return app.models.ExpAssay
                .find({
                where: {
                    assayId: {
                        inq: data.expAssay2reagents.map(function (expAssay2reagent) {
                            return expAssay2reagent.assayId;
                        })
                    }
                },
                fields: {
                    assayWell: true,
                    assayId: true,
                    assayImagePath: true,
                    expGroupId: true,
                    plateId: true,
                    screenId: true,
                    expWorkflowId: true,
                },
            });
        })
            .then(function (expAssays) {
            data.expAssays = expAssays;
            return data;
        })
            .then(function (data) {
            return app.models.ExpPlate
                .find({
                where: {
                    expWorkflowId: data.expAssays[0].expWorkflowId
                }
            });
        })
            .then(function (expPlates) {
            data.expPlates = expPlates;
            return data;
        })
            .then(function (data) {
            return app.models.ModelPredictedCounts
                .find({
                where: {
                    expWorkflowId: data.expAssays[0].expWorkflowId
                }
            });
        })
            .then(function (modelPredictedCounts) {
            data.modelPredictedCounts = modelPredictedCounts;
            return data;
        })
            .then(function (data) {
            return app.models.ExpScreen
                .findOne({
                where: { screenId: data.expAssays[0].screenId },
                fields: {
                    screenId: true,
                    screenName: true,
                    screenType: true,
                    screenStage: true,
                }
            });
        })
            .then(function (expScreens) {
            data.expScreens = [expScreens];
            return data;
        })
            .then(function (data) {
            return app.models.ExpScreenUploadWorkflow
                .findOne({
                where: { id: data.expAssays[0].expWorkflowId },
                fields: {
                    id: true,
                    name: true,
                    screenId: true,
                    biosamples: true,
                    assayDates: true,
                    temperature: true,
                    screenType: true,
                    screenStage: true
                }
            });
        })
            .then(function (expScreenWorkflow) {
            data.expWorkflows = [expScreenWorkflow];
            return ExpSet.extract.getExpDesignsByExpWorkflowId(data, search);
        })
            .then(function (data) {
            return ExpSet.extract.genExpSetAlbums(data, search);
        })
            .then(function (data) {
            data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
            return ExpSet.extract.saveToCache(data, search);
        })
            .then(function (data) {
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.fetchFromCache = function (data, search) {
    return new Promise(function (resolve, reject) {
        var key = "contact-sheet-byPlate-" + data.expAssay2reagents[0].expWorkflowId;
        redisClient.getAsync(key)
            .then(function (obj) {
            if (obj) {
                // data = JSON.parse(obj);
                // data.fetchedFromCache = true;
                data.fetchedFromCache = false;
                resolve(data);
            }
            else {
                data.fetchedFromCache = false;
                resolve(data);
            }
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.saveToCache = function (data, search) {
    return new Promise(function (resolve, reject) {
        var key = "contact-sheet-byPlate-" + data.expWorkflows[0].id;
        redisClient.set(key, JSON.stringify(data), 'EX', 60 * 60 * 24, function (err, reply) {
            resolve(data);
        });
    });
};
ExpSet.extract.getExpDesignsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpDesign
            .find({ where: { expWorkflowId: data.expAssays[0].expWorkflowId } })
            .then(function (expDesigns) {
            var groups = lodash_1.groupBy(expDesigns, 'treatmentGroupId');
            data.expSets = Object.keys(groups).map(function (treatmentGroupId) {
                return groups[treatmentGroupId];
            });
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Counts goes in its own separate corner,
 * because counts can be updated
 * @param data
 * @param search
 */
ExpSet.extract.getCountsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        if (!search.includeCounts) {
            resolve(data);
        }
        else {
            app.models.ModelPredictedCounts
                .find({
                where: {
                    expWorkflowId: data.expAssays[0].expWorkflowId,
                }
            })
                .then(function (results) {
                data.modelPredictedCounts = results;
                resolve(data);
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
    });
};
//TODO Add this to main ExpSetModule
ExpSet.extract.genExpGroupTypeAlbums = function (data, search) {
    //For the expSet albums limit to 4
    data.albums.map(function (album) {
        ['ctrlNullImages', 'ctrlStrainImages'].map(function (albumType) {
            album[albumType] = lodash_1.shuffle(album[albumType].slice(0, search.ctrlLimit));
        });
    });
    var expGroupTypes = lodash_1.groupBy(data.expAssay2reagents, 'reagentType');
    Object.keys(expGroupTypes).map(function (expGroup) {
        var mappedExpGroup = ExpSet.extract.mapExpGroupTypes(expGroup);
        expGroupTypes[mappedExpGroup] = expGroupTypes[expGroup];
        expGroupTypes[mappedExpGroup] = ExpSet.extract.genImageMeta(data, expGroupTypes[mappedExpGroup]);
        if (lodash_1.isEqual(mappedExpGroup, 'ctrlNull') || lodash_1.isEqual(mappedExpGroup, 'ctrlStrain')) {
            expGroupTypes[mappedExpGroup].map(function (imageMeta) {
                imageMeta.treatmentGroupId = null;
            });
        }
        delete expGroupTypes[expGroup];
    });
    data.expGroupTypeAlbums = expGroupTypes;
    //End Cache here
    return data;
};
ExpSet.extract.genAlbumsByPlate = function (data, search) {
    ['treatReagent', 'ctrlReagent'].map(function (mappedExpGroup) {
        data.expGroupTypeAlbums[mappedExpGroup] = lodash_1.groupBy(data.expGroupTypeAlbums[mappedExpGroup], 'plateId');
    });
    data = ExpSet.extract.extractPlatesNoScore(data, search);
    return data;
};
/**
 * Find the first set of plates that has no score
 * This seems like a stupidly complex way of doing this
 * TODO Think of a better way to do this
 * @param data
 * @param search
 */
ExpSet.extract.extractPlatesNoScore = function (data, search) {
    var scoredPlateIds = [];
    var unScoredPlateIds = [];
    Object.keys(data.expGroupTypeAlbums.treatReagent).map(function (tplateId) {
        var foundAssay = lodash_1.find(data.expGroupTypeAlbums.treatReagent[tplateId], { manualScoreByAssay: null });
        // This plate was already scored!
        if (!foundAssay) {
            scoredPlateIds.push(tplateId);
        }
        else {
            unScoredPlateIds.push(tplateId);
        }
    });
    // let treatReagentPlateIds = Object.keys(data.expGroupTypeAlbums.treatReagent);
    var ctrlReagentPlateIds = Object.keys(data.expGroupTypeAlbums.ctrlReagent);
    // TODO Add condition for all plates scores (which shouldn't happen)
    // Get a single plate to score
    var scoreThisPlate = unScoredPlateIds.shift();
    var treatI = Object.keys(data.expGroupTypeAlbums.treatReagent).indexOf(scoreThisPlate);
    // Most of the time N2s have the same number of replicates as the mel-28
    // But sometimes they don't
    // If they don't just get the last n2 plate and call it a day
    var ctrlPlateId = null;
    if (treatI < ctrlReagentPlateIds.length) {
        ctrlPlateId = ctrlReagentPlateIds[treatI];
    }
    else {
        ctrlPlateId = ctrlReagentPlateIds.pop();
    }
    data.expGroupTypeAlbums.treatReagent = data.expGroupTypeAlbums.treatReagent[scoreThisPlate];
    data.expGroupTypeAlbums.ctrlReagent = data.expGroupTypeAlbums.ctrlReagent[ctrlPlateId];
    data.expGroupTypeAlbums.treatReagent = lodash_1.orderBy(data.expGroupTypeAlbums.treatReagent, 'well');
    data.expGroupTypeAlbums.ctrlReagent = lodash_1.orderBy(data.expGroupTypeAlbums.ctrlReagent, 'well');
    return data;
};
//# sourceMappingURL=ExpSetScoringExtractByPlate.js.map