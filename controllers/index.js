var express = require('express');
var models = require(__base + 'models');
var fs = require('fs');
var mongoose = require('mongoose');
var _str = require('underscore.string');

var getModel = module.exports.getModel = function (modelName) {
    modelName = _str.capitalize(modelName);
    return mongoose.model(modelName);
}

var findModelFilePath = module.exports.findModelFilePath = function (modelName) {
    return __base + 'models/' + modelName + '.js';
}

var findModelSchemaFilePath  = module.exports.findModelSchemaFilePath  = function (modelName) {
    return __base + 'models/' + modelName + '_Schema.js';
}


var updateSchema = module.exports.updateSchema = function (modelName, res, schema, callback) {

    modelName = _str.capitalize(modelName);
    res.render('model_template_schema', {schema: schema}, function (err, html) {
        fs.writeFile("models/" + modelName + "_schema.js",
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

var removeModel = module.exports.removeModel = function removeModel(modelName) {

    modelName = _str.capitalize(modelName);
    delete mongoose.models[modelName];
    delete mongoose.modelSchemas[modelName];
}

var createModel = module.exports.createModel = function (modelName, res, callback) {

    modelName = _str.capitalize(modelName);
    var displayName = modelName;
    var slugName = _str.slugify(modelName);
    slugName = _str.capitalize(slugName);

    res.render('model_template', {
            modelName: displayName,
            modelNameSlug: slugName,
            modelNameDisplayName: displayName
        },
        function (err, html) {
            fs.writeFile("models/" + modelName + ".js",
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

var deleteFile = function(filePath, cb) {
    fs.unlink(filePath,
        function(err) {
            if(err) {
                cb(err);
            }
            else {
                cb();
            }
        }
    );
}

var deleteModel = module.exports.deleteModel = function(modelName, cb) {

    modelName = _str.capitalize(modelName);

    deleteFile(findModelFilePath(modelName), function (err) {
        if (err)
        {

        }
        else
        {
            deleteFile(findModelSchemaFilePath(modelName), cb)
        }
    })
}