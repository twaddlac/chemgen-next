"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var config = require("config");
var models_1 = require("../../../types/sdk/models");
var Promise = require("bluebird");
var deepcopy = require("deepcopy");
var WpPosts = app.models['WpPosts'];
WpPosts.load.workflows.createPost = function (workflowData, postData) {
    var postObj = new models_1.WpPostsResultSet({
        postAuthor: 1,
        postType: postData.viewType,
        commentCount: 0,
        menuOrder: 0,
        postStatus: 'publish',
        postTitle: postData.title,
        postName: postData.titleSlug,
        postExcerpt: '',
        toPing: '',
        pinged: '',
        postContentFiltered: '',
        postParent: 0,
        pingStatus: 'open',
        commentStatus: 'open',
        guid: config.get('wpUrl') + postData.titleSlug,
    });
    var dateNow = new Date(Date.now());
    var postObjWithDate = deepcopy(postObj);
    postObjWithDate.postDate = dateNow;
    postObjWithDate.postDateGmt = dateNow;
    postObjWithDate.postContent = '';
    postObjWithDate.postModified = dateNow;
    postObjWithDate.postModifiedGmt = dateNow;
    return new Promise(function (resolve, reject) {
        WpPosts.findOrCreate({
            where: { postTitle: postObj.postTitle },
        }, postObjWithDate)
            .then(function (results) {
            return WpPosts.load.updatePost(workflowData, postData, results[0]);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(__filename + " WpPosts " + error);
            reject(new Error(error));
        });
    });
};
WpPosts.load.updatePost = function (workflowData, postData, postResult) {
    return new Promise(function (resolve, reject) {
        postResult.postContent = postData.postContent;
        var dateNow = new Date(Date.now());
        // const dateNow = Date.now();
        postResult.postModified = dateNow;
        postResult.postModifiedGmt = dateNow;
        // This was nuts - the in memory model I used for testing could deal with any of these
        // But the real model could only use updateOrCreate
        // I had to dig around in the tests for mysql data juggler to figure this out
        // TODO Write some tests for this
        // return postObj.save;
        // return WpPosts.upsertWithWhere({where: {id: postObj.id}}, postObj);
        // return postObj.updateAttribute({postContent: postContent});
        WpPosts.updateOrCreate(postResult)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(__filename + " WpPosts " + error);
            reject(new Error(error));
        });
    });
};
WpPosts.load.workflows.genImagePost = function (postData, imagePostData) {
    var postObj = {
        postAuthor: 1,
        postType: 'attachment',
        postMimeType: 'image/jpeg',
        commentCount: 0,
        menuOrder: 0,
        postContentFiltered: '',
        pinged: '',
        postContent: '',
        postStatus: 'inherit',
        postExcerpt: '',
        toPing: '',
        postTitle: imagePostData.title,
        postName: imagePostData.title,
        postParent: 0,
        pingStatus: 'closed',
        commentStatus: 'open',
        guid: config.get('wpUrl') + '/wp-content/uploads/assays/' + imagePostData.imagePath,
    };
    // let dateNow = new Date().toISOString();
    var dateNow = new Date(Date.now());
    var postObjWithDate = deepcopy(postObj);
    postObjWithDate.postDate = dateNow;
    postObjWithDate.postDateGmt = dateNow;
    postObjWithDate.postModified = dateNow;
    postObjWithDate.postModifiedGmt = dateNow;
    return new Promise(function (resolve, reject) {
        WpPosts
            .findOrCreate({
            where: app.etlWorkflow.helpers.findOrCreateObj(postObj),
        }, postObjWithDate)
            .then(function (results) {
            var imagePostResult = {
                id: results[0]['id'],
                guid: results[0]['guid'],
                postTitle: results[0]['postTitle'],
                imagePath: imagePostData.imagePath,
                postExcerpt: '',
            };
            //TODO Change this structure - create all assay posts, then image posts, then do metadata/taxonomies
            return WpPosts.load.createImageMetaData(postData, imagePostResult);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(__filename + " WpPosts " + error);
            reject(new Error(error));
        });
    });
};
/**
 * This links a single wordpress post to an image, creating the featured image
 * The postmeta is some pre-json data structure, but there are plenty of libraries to convert json -> wp meta
 * @param {WpPostsResultSet} assayPostData
 * @param {WpPostsResultSet} assayImagePostData
 */
WpPosts.load.createImageMetaData = function (postData, imagePostData) {
    // @ts-ignore
    var baseImage = deepcopy(imagePostData.imagePath);
    baseImage = baseImage.replace('.jpeg', '');
    return new Promise(function (resolve, reject) {
        var createObjs = [
            {
                postId: postData.id,
                metaKey: '_thumbnail_id',
                metaValue: imagePostData.id,
            },
            {
                postId: imagePostData.id,
                metaKey: '_wp_attached_file',
                // @ts-ignore
                metaValue: 'assays/' + imagePostData.imagePath,
            },
            {
                postId: imagePostData.id,
                metaKey: '_wp_attachment_metadata',
                metaValue: WpPosts.helpers.genImageMeta(baseImage),
            },
        ];
        // @ts-ignore
        Promise.map(createObjs, function (createObj) {
            return app.models.WpPostmeta
                .findOrCreate({
                where: app.etlWorkflow.helpers.findOrCreateObj(createObj)
            }, createObj);
        })
            .then(function () {
            resolve({ postData: postData, imagePostData: imagePostData });
        })
            .catch(function (error) {
            app.winston.error(__filename + " WpPosts " + error);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=WpPosts.js.map