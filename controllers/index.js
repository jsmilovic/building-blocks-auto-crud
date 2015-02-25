var express = require('express');
var models = require(__base + 'models');
var fs = require('fs');
var mongoose = require('mongoose');
var _str = require('underscore.string');

module.exports.getModel = function (modelName) {
    return mongoose.model(modelName);
}

module.exports.findModelFilePath = function (modelName) {
    return __base + 'models/' + modelName + '.js';
}

module.exports.findModelSchemaFilePath = function (modelName) {
    return __base + 'models/' + modelName + '_Schema.js';
}


module.exports.updateSchema = function (collectionName, res, schema, callback) {

    res.render('model_template_schema', {schema: schema}, function (err, html) {
        fs.writeFile("models/" + collectionName + "_schema.js",
            function () {
                return html;
            }(),
            function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    callback();
                }
            }
        )
    })
}

module.exports.removeModel = function removeModel(modelName) {
    delete mongoose.models[modelName];
    delete mongoose.modelSchemas[modelName];
}

module.exports.createModel = function (collectionName, res, callback) {

    var displayName = collectionName;
    var slugName = _str.slugify(collectionName);
    slugName = _str.capitalize(slugName);

    res.render('model_template', {
            modelName: displayName,
            modelNameSlug: slugName,
            modelNameDisplayName: displayName
        },
        function (err, html) {
            fs.writeFile("models/" + collectionName + ".js",
                function () {
                    return html;
                }(),
                function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (typeof callback == "function")
                            callback();
                    }
                }
            )
        })
}
