"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var types_1 = require("../types");
var config = require("config");
var ExpSet = app.models.ExpSet;
/**
 *  ExpSetSearch the expAssay2reagents table given the search results
 *  From there get assays, and get includeCounts
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.searchExpAssay2reagents = function (data, search) {
    return new Promise(function (resolve, reject) {
        var expAssay2reagentSearch = app.models.ExpSet.extract.buildExpAssay2reagentSearch(data, search);
        app.models.ExpAssay2reagent
            .find(expAssay2reagentSearch)
            .then(function (results) {
            data.expAssay2reagents = results;
            return app.models.ExpSet.extract.buildExpSets(data, search);
        })
            .then(function (data) {
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * Build the 'where' query against the ExpAssay2reagent table (the main experiment table)
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 * @returns {any[]}
 */
ExpSet.extract.buildQuery = function (data, search) {
    var or = [];
    var expOr = ['screen', 'expWorkflow', 'plate', 'expGroup', 'assay'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var searchObject = {};
            searchObject[searchType + "Id"] = { inq: search[searchType + "Search"] };
            return searchObject;
        }
    }).filter(function (or) {
        return or;
    });
    if (!lodash_1.isEmpty(data.rnaisList) && !lodash_1.isEmpty(data.compoundsList)) {
        var searchType = 'library';
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var searchObject = {};
            searchObject[searchType + "Id"] = { inq: search[searchType + "Search"] };
            expOr.push(searchObject);
        }
    }
    return ExpSet.extract.buildReagentQuery(data, or, expOr);
};
ExpSet.extract.buildReagentQuery = function (data, or, expOr) {
    ['rnai', 'compounds'].map(function (reagentType) {
        if (!lodash_1.isEmpty(data[reagentType + "sList"])) {
            data[reagentType + "sList"].map(function (Row) {
                var obj = {
                    and: [
                        { reagentId: Row[reagentType + "Id"] },
                        { libraryId: Row.libraryId },
                    ]
                };
                expOr.map(function (exp) {
                    obj.and.push(exp);
                });
                or.push(obj);
            });
        }
        else {
            var obj_1 = {
                and: []
            };
            expOr.map(function (exp) {
                obj_1.and.push(exp);
            });
            or.push(obj_1);
        }
    });
    return or;
};
ExpSet.extract.buildExpAssay2reagentSearch = function (data, search) {
    var or = ExpSet.extract.buildQuery(data, search);
    return {
        where: { or: or, reagentId: { 'neq': null } },
        limit: data.pageSize,
        skip: data.skip,
        // skip: search.currentPage * search.pageSize,
        fields: {
            assay2reagentId: true,
            reagentType: true,
            expGroupId: true,
            plateId: true,
            assayId: true,
            reagentId: true,
            libraryId: true,
            reagentTable: true,
        },
    };
};
/**
 * This only builds the most basic pagination
 * It does not do any filtering for assays that already have scores
 * Or ordering expAssays by any rank
 * To do eithe of these things see ExpSet.extract.workflows.scoring
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildBasicPaginationData = function (data, search) {
    return new Promise(function (resolve, reject) {
        var or = app.models.ExpSet.extract.buildQuery(data, search);
        app.paginateModel('ExpAssay2reagent', { or: or }, search.pageSize)
            .then(function (pagination) {
            data.currentPage = search.currentPage;
            data.skip = search.skip;
            data.pageSize = search.pageSize;
            data.totalPages = pagination.totalPages;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * This is the main workflow
 * Once we have a set of expAssay2reagents, get the corresponding expAssays, includeCounts, expPlates, expScreens, and expWorkflows
 * Also generate an album for use in the interface
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildExpSets = function (data, search) {
    return new Promise(function (resolve, reject) {
        //TODO Ensure there are expAssayIds!
        if (lodash_1.isEmpty(data.expAssay2reagents)) {
            app.winston.error(JSON.stringify(data, null, 2));
            resolve(data);
            // reject(new Error('invalid data - no expAssay2reagents'));
        }
        // This ONLY returns the treat_rnai and ctrl_rnai  expGroups
        // ctrl_null and ctrl_strain are L4440s and don't have a reagentId
        app.models.ExpAssay
            .find({
            where: {
                assayId: {
                    inq: data.expAssay2reagents.map(function (expAssay2reagent) {
                        return expAssay2reagent.assayId;
                    })
                }
            },
            fields: {
                screenId: true,
                expWorkflowId: true,
                expGroupId: true,
                assayImagePath: true,
                plateId: true,
                assayId: true
            },
        })
            .then(function (results) {
            //TODO if returning includeCounts also return ExpAssay is redundent
            // data['expAssays'] = results;
            data.expAssays = results;
            var expGroupIds = results.map(function (expAssay) {
                return { expGroupId: expAssay.expGroupId };
            });
            return app.models.ExpDesign.extract.workflows.getExpSets(expGroupIds);
        })
            .then(function (results) {
            data.expSets = results.expDesigns;
            return ExpSet.extract.sanityChecks(data, search);
        })
            .then(function (results) {
            return ExpSet.extract.getCounts(results, search);
        })
            .then(function (results) {
            return ExpSet.extract.getExpData(results, search);
        })
            .then(function (data) {
            data = ExpSet.extract.genExpSetAlbums(data, search);
            data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
            data = ExpSet.extract.insertCountsDataImageMeta(data);
            data = ExpSet.extract.insertExpManualScoresImageMeta(data);
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * Depending on how the search is run (genes list, expGroup, etc)
 * We may be missing different pieces of data
 * For instance if we search by expGroup=1, up to here only expAssay2Reagent with expGroup=1 will be returned
 * Or if searching for genes we won't have any L4440s
 * So this is a very brute force approach to ensure there is no data missing
 * But we want the whole expSet
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.sanityChecks = function (data, search) {
    return new Promise(function (resolve, reject) {
        // This gets the ctrl_null and ctrl_strain includeCounts
        var ctrlExpGroupIds = [];
        var treatExpGroupIds = [];
        data.expSets.map(function (expSet) {
            expSet.map(function (expDesign) {
                ctrlExpGroupIds.push({ expGroupId: expDesign.controlGroupId });
                treatExpGroupIds.push({ expGroupId: expDesign.treatmentGroupId });
            });
        });
        ctrlExpGroupIds = lodash_1.uniqBy(ctrlExpGroupIds, 'expGroupId');
        // @ts-ignore
        Promise.map(ctrlExpGroupIds, function (ctrlExpGroupId) {
            return app.models.ExpAssay
                .find({
                where: ctrlExpGroupId,
                limit: 10,
                fields: {
                    plateId: true,
                    screenId: true,
                    expWorkflowId: true,
                    expGroupId: true,
                    assayImagePath: true,
                    assayId: true
                },
            })
                .then(function (results) {
                results = lodash_1.shuffle(results);
                results = lodash_1.slice(results, 0, search.ctrlLimit);
                results.map(function (result) {
                    data.expAssays.push(result);
                });
                return;
            })
                .catch(function (error) {
                app.winston.error(error);
                return new Error(error);
            });
        })
            .then(function () {
            return app.models.ExpAssay
                .find({
                where: {
                    expGroupId: {
                        inq: treatExpGroupIds.map(function (expGroup) {
                            return expGroup.expGroupId;
                        }),
                    }
                }
            });
        })
            .then(function (expAssays) {
            expAssays.map(function (expAssay) {
                data.expAssays.push(expAssay);
            });
            data.expAssays = lodash_1.uniqBy(data.expAssays, 'assayId');
        })
            .then(function () {
            return app.models.ExpAssay2reagent
                .find({
                where: {
                    assayId: {
                        inq: data.expAssays.map(function (expAssay) {
                            return expAssay.assayId;
                        }),
                    },
                    reagentId: { 'neq': null }
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
            });
        })
            .then(function (results) {
            results.map(function (result) {
                data.expAssay2reagents.push(result);
            });
            data.expAssay2reagents = lodash_1.uniqBy(data.expAssay2reagents, 'assay2reagentId');
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * Get the experimental data for this
 * ExpPlate, expScreen, and batchName
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.getExpData = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpPlate
            .find({
            where: {
                plateId: {
                    inq: data.expAssays.map(function (expAssay) {
                        return expAssay.plateId;
                    }),
                }
            },
            fields: {
                plateId: true,
                instrumentPlateId: true,
                temperature: true,
                screenId: true,
                expWorkflowId: true,
                barcode: true,
            }
        })
            .then(function (expPlateResults) {
            data.expPlates = expPlateResults;
            return app.models.ExpScreen
                .find({
                where: {
                    screenId: {
                        inq: data.expPlates.map(function (expPlate) {
                            return expPlate.screenId;
                        })
                    }
                }
            });
        })
            .then(function (expScreenResults) {
            data.expScreens = expScreenResults;
            return app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    id: {
                        inq: data.expAssays.map(function (expAssay) {
                            return expAssay.expWorkflowId;
                        })
                    }
                },
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
            .then(function (expWorkflowResults) {
            data.expWorkflows = expWorkflowResults;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getCounts = function (data, search) {
    return new Promise(function (resolve, reject) {
        if (!search.includeCounts) {
            resolve(data);
        }
        else {
            app.models.ModelPredictedCounts
                .find({
                where: {
                    assayId: {
                        inq: data.expAssays.map(function (expAssay) {
                            return expAssay.assayId;
                        }),
                    }
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
ExpSet.extract.genExpSetAlbums = function (data, search) {
    if (!search.includeAlbums) {
        return data;
    }
    else {
        data.expSets.map(function (expSet) {
            var album = {};
            album.expWorkflowId = expSet[0].expWorkflowId;
            album.treatmentReagentId = expSet[0].treatmentGroupId;
            album.treatmentGroupId = expSet[0].treatmentGroupId;
            try {
                album.ctrlReagentId = lodash_1.find(expSet, function (set) {
                    return lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_rnai') || lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_compound') || lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_chemical');
                }).controlGroupId;
            }
            catch (error) {
                // app.winston.error('There is no ctrl for the reagent!');
            }
            try {
                album.ctrlStrainId = lodash_1.find(expSet, function (set) {
                    return lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_strain');
                }).controlGroupId;
            }
            catch (error) {
                // app.winston.error('There is no ctrl strain');
            }
            try {
                album.ctrlNullId = lodash_1.find(expSet, function (set) {
                    return lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_null');
                }).controlGroupId;
            }
            catch (error) {
                // app.winston.error('There is no ctrl null');
            }
            ['treatmentReagent', 'ctrlReagent', 'ctrlStrain', 'ctrlNull'].map(function (expGroupType) {
                album[expGroupType + "Images"] = data.expAssays.filter(function (expAssay) {
                    return lodash_1.isEqual(expAssay.expGroupId, album[expGroupType + "Id"]);
                }).map(function (expAssay) {
                    return ExpSet.extract["buildImageObj" + config.get('site')](expAssay);
                });
                album[expGroupType + "Images"] = lodash_1.uniqBy(album[expGroupType + "Images"], 'assayImagePath');
            });
            data.albums.push(album);
        });
        return data;
    }
};
/**
 * Grab ExpSets by workflowId - this is the the most optimized function if there is no geneList/chemicalList
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getExpSetsByWorkflowId = function (search) {
    return new Promise(function (resolve, reject) {
        search = new types_1.ExpSetSearch(search);
        var data = new types_1.ExpSetSearchResults({});
        var or = ExpSet.extract.buildQuery(data, search);
        app.models.ExpAssay2reagent
            .findOne({ or: or, reagentId: { 'neq': null } })
            .then(function (expAssay2reagent) {
            data.expAssay2reagents = [expAssay2reagent];
            if (!data.expAssay2reagents || !data.expAssay2reagents.length) {
                resolve();
            }
            else {
                return ExpSet.extract.fetchFromCache(data, search, data.expAssay2reagents[0].expWorkflowId);
            }
        })
            .then(function (data) {
            // Check to see if it was fetched from the cache
            if (!data.fetchedFromCache) {
                return ExpSet.extract.getExpDataByExpWorkflowId(data, search, data.expAssay2reagents[0].expWorkflowId);
            }
            else {
                return data;
            }
        })
            .then(function (data) {
            return ExpSet.extract.getExpManualScoresByExpWorkflowId(data, search);
        })
            .then(function (data) {
            return ExpSet.extract.getModelPredictedCountsByExpWorkflowId(data, search);
        })
            .then(function (data) {
            data = ExpSet.extract.insertCountsDataImageMeta(data);
            data = ExpSet.extract.insertExpManualScoresImageMeta(data);
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.getReagentData = function (data, search) {
    var reagentTypes = lodash_1.groupBy(data.expAssay2reagents, 'reagentTable');
    delete reagentTypes['undefined'];
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(Object.keys(reagentTypes), function (reagentType) {
            if (reagentType) {
                return ExpSet.extract.workflows["getReagentData" + reagentType](data, reagentTypes[reagentType]);
            }
            else {
                return;
            }
        })
            .then(function () {
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.getReagentDataChemicalLibraryStock = function (data, expAssay2reagents) {
    return new Promise(function (resolve, reject) {
        var or = [];
        expAssay2reagents.map(function (expAssay2reagent) {
            if (expAssay2reagent.reagentId) {
                //TODO There is a bug in some of these uploads that the libraryId is 1 instead of whatever it should be
                //But the reagentId is uniqueue anyways
                or.push({ and: [{ compoundId: expAssay2reagent.reagentId }] });
            }
        });
        app.models.ChemicalLibrary
            .find({
            where: { or: or }
        })
            .then(function (results) {
            data.compoundsList = results;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.getReagentDataRnaiLibraryStock = function (data, expAssay2reagents) {
    return new Promise(function (resolve, reject) {
        var or = expAssay2reagents.map(function (expAssay2reagent) {
            return { and: [{ rnaiId: expAssay2reagent.reagentId }, { libraryId: expAssay2reagent.libraryId }] };
        });
        app.models.RnaiLibrary
            .find({
            where: { or: or }
        })
            .then(function (results) {
            data.rnaisList = results;
            return app.models.RnaiWormbaseXrefs
                .find({
                where: {
                    wbGeneSequenceId: {
                        inq: data.rnaisList.map(function (rnai) {
                            return rnai.geneName;
                        })
                    }
                },
                limit: 1000,
            });
        })
            .then(function (results) {
            data.rnaisXrefs = results;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Build the image URLS based on the site
 * By default the
 * @param expAssay
 */
ExpSet.extract.buildImageObjDEV = function (expAssay) {
    return {
        assayImagePath: expAssay.assayImagePath,
        src: config.get('sites')['DEV']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel.jpeg",
        caption: "Image " + expAssay.assayImagePath + " caption here",
        thumb: config.get('sites')['DEV']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel-600x600.jpeg",
    };
};
ExpSet.extract.buildImageObjAD = function (expAssay) {
    return {
        assayImagePath: expAssay.assayImagePath,
        src: config.get('sites')['AD']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel.jpeg",
        caption: "Image " + expAssay.assayImagePath + " caption here",
        thumb: config.get('sites')['DEV']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel-600x600.jpeg",
    };
};
ExpSet.extract.buildImageObjNY = function (expAssay) {
    return {
        assayImagePath: expAssay.assayImagePath,
        src: config.get('sites')['NY']['imageUrl'] + "/" + expAssay.assayImagePath + ".bmp",
        caption: "Image " + expAssay.assayImagePath + " caption here",
        thumb: config.get('sites')['NY']['imageUrl'] + "/" + expAssay.assayImagePath + ".bmp",
    };
};
//# sourceMappingURL=ExpSetExtract.js.map