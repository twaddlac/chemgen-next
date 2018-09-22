"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../../../server/server');
var jsonfile = require('jsonfile');
var path = require('path');
var models_1 = require("../../../common/types/sdk/models");
var lodash_1 = require("lodash");
var fs = require('fs');
var config = require("config");
var request = require('request-promise');
var Promise = require('bluebird');
var genImageFileNames = function (expPlate, well) {
    var imageArray = expPlate.instrumentPlateImagePath.split('\\');
    var folder = imageArray[4];
    var imageId = imageArray[5];
    var plateId = expPlate.instrumentPlateId;
    var imagePath = [
        '/mnt/Plate_Data/',
        folder, '/',
        imageId, '/',
        imageId
    ].join('');
    //This is only for worms - cells are different
    var outDir = '/mnt/image/cells/';
    var makeDir = outDir + folder + '/' + plateId;
    var exts = [];
    lodash_1.range(0, 9).map(function (field) {
        lodash_1.range(0, 5).map(function (channel) {
            exts.push("f0" + field + "d" + channel);
        });
    });
    // console.log(JSON.stringify(exts));
    // process.exit(0);
    return exts.map(function (ext) {
        var assayName = expPlate.barcode + '_' + well + ext;
        var instrumentImage = imagePath + '_' + well + ext + '.C01';
        var baseImage = makeDir + '/' + assayName;
        var random = Math.random().toString(36).substring(7);
        var tmpImage = '/tmp/' + random + '/' + random + '.C01';
        //TODO Get rid of all the base images - just have 1 and make the extensions
        return {
            convertImage: baseImage + '.tiff',
            convertBmp: baseImage + '.bmp',
            instrumentImage: instrumentImage,
            makeDir: makeDir,
            baseImage: baseImage,
            assayName: assayName,
            plateId: plateId,
            random: random,
            tmpImage: tmpImage,
            thumbSizes: [
                '1024x1024',
                '1080x1080',
                '768x768',
                '600x600',
                '400x400',
                '300x300',
                '150x150',
            ],
        };
    });
};
var submitImageJob = function (imagesList) {
    console.log('In submitImageJob');
    return new Promise(function (resolve, reject) {
        Promise.map(imagesList, function (images) {
            console.log(JSON.stringify(images));
            return app.models.ExpAssay.helpers.genConvertImageCommands(images)
                .then(function (commands) {
                var imageJob = {
                    title: "convertImage-" + images.plateId + "-" + images.assayName,
                    commands: commands,
                    plateId: images.plateId,
                };
                var requestParams = {
                    uri: "http://" + config.get('imageConversionHost') + ":" + config.get('imageConversionPort'),
                    body: imageJob,
                    method: 'POST',
                    json: true,
                };
                console.log(JSON.stringify(requestParams));
                if (!fs.existsSync(images.baseImage + "-autolevel.png")) {
                    //TODO Make this a parameter somewhere
                    return request({
                        uri: "http://" + config.get('imageConversionHost') + ":" + config.get('imageConversionPort'),
                        body: imageJob,
                        method: 'POST',
                        json: true,
                    })
                        .then(function (response) {
                        console.log(JSON.stringify(response));
                        return {
                            baseImage: images.baseImage,
                            script: imageJob.title,
                            convert: 1
                        };
                    })
                        .catch(function (error) {
                        console.log(JSON.stringify(error));
                        return {
                            baseImage: images.baseImage,
                            script: imageJob.title,
                            convert: 0
                        };
                    });
                }
                else {
                    return {
                        baseImage: images.baseImage,
                        script: imageJob.title,
                        convert: 0
                    };
                }
            })
                .catch(function (error) {
                console.log(JSON.stringify(error));
                throw new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            console.log('resolving results!');
            resolve(results);
        })
            .catch(function (error) {
            console.log(JSON.stringify(error));
            reject(new Error(error));
        });
    });
};
var plateDataList = jsonfile.readFileSync(path.resolve(__dirname, 'upload_these.json'));
plateDataList = lodash_1.shuffle(plateDataList);
Promise.map(plateDataList, function (plateData) {
    var expPlate = new models_1.ExpPlateResultSet({
        barcode: plateData.name,
        instrumentPlateImagePath: plateData.imagepath,
        instrumentPlateId: plateData.csPlateid
    });
    console.log('got experiment plate!');
    var wells = app.etlWorkflow.helpers.list384Wells();
    console.log('got wells!');
    return Promise.map(wells, function (well) {
        var imageData = genImageFileNames(expPlate, well);
        return submitImageJob(imageData);
    })
        .then(function (results) {
        console.log(JSON.stringify(results));
        return results;
    })
        .catch(function (error) {
        console.log(JSON.stringify(error));
        throw new Error(error);
    });
}, { concurrency: 1 })
    .then(function (results) {
    console.log('I think this is done!');
})
    .catch(function (error) {
    console.log(JSON.stringify(error));
});
//# sourceMappingURL=convert_cell_images.js.map