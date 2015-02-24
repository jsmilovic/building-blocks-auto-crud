var express = require('express');
var router = express.Router();
var models = require(__base + 'models');
var fs = require('fs');
var mongoose = require('mongoose')
var _str = require('underscore.string');

router.get('/', function(req, res, next) {
  var models = [];

  mongoose.modelNames().forEach(function(val,index) {
    models.push({slug: mongoose.models[val].slug() , displayName: mongoose.models[val].displayName()})
  })

  res.render(req.baseUrl.substr(1), {
    "baseUrl": req.baseUrl,
    "collections" : models
  });
});

router.get('/create', function(req,res,next) {
  res.render(req.baseUrl.substr(1) + 'create', {"baseUrl": req.baseUrl})
})

router.post('/create', function(req,res,next){

  req.body.name = _str.capitalize(req.body.name);

  //Define schema for this new type
  createModel(req.body.name, res,
    updateSchema(req.body.name, res, {},
      function() {
        require(findModelFilePath(req.body.name));
        models = require(__base + 'models');
        res.writeHead(301, {
          Location: (req.socket.encrypted ? 'https://' : 'http://') +
          req.headers.host + req.baseUrl + '/' + req.body.name
        });
        res.end();
      }
    )
  )
})


router.post('/:collection', function(req,res,next) {
  var Model = getModel(req.params.collection);

  Model.create({'title': 'Jordan'});
})

router.get('/:collection', function(req, res, next) {
  var collection = getModel(req.params.collection)

  collection.find({},{},function(error,collection){
    res.render(req.baseUrl.substr(1) + "collection", {
      "collection" : collection,
      "baseUrl": req.baseUrl +  req.params.collection
    });
  });
});

router.get('/:collection/schema', function(req, res, next) {
  var paths = mongoose.models[req.params.collection].schema.paths
  var fields = [];

  for (p in paths) {
    var name = paths[p].path;
    fields.push({title: paths[p].path, type: paths[p].instance })
  }

  res.render(req.baseUrl.substr(1) + "collection_schema", {
      "collection" : fields
  });
});

router.delete('/:collection', function(req,res,next) {
  var collection = _str.capitalize(req.params.collection);
  var filePath = findModelFilePath(collection);

  fs.unlink(filePath,
    function(err) {
      removeModel(collection);
      if(err) {
        res.end();
      }
      else {
        res.end(JSON.stringify({"success" : true, "status" : 200}));
      }
    }
  );
})

router.get('/:collection/:id', function(req, res, next) {
  var model = getModel(req.params.collection);

  model.findById(req.params.id,function(error,item){
    var fields = [];
    var paths = model.schema.paths;

    for (p in paths) {
      fields.push({name: paths[p].path,required: paths[p].isRequired, type: paths[p].instance})
    }

    res.render(req.baseUrl.substr(1) + "item_view", {
      "schema": fields,
      "item" : item
    });
  });
});

router.post('/:collection/schema', function(req,res,next) {

  var collectionName = req.params.collection;
  var schema = require(findModelFilePath( collectionName + "_Schema"));
  var newItem = {};

  for (item in req.body) {
    newItem[item] = req.body[item];
  }

  schema[newItem['name']] = newItem;

  res.render('model_template_schema',{schema: schema}, function(err, html) {
    fs.writeFile("models/" + collectionName + "_Schema.js",
        function() {
          return html;
        }(), function (err) {
          if (err) {
            console.log(err)
          }
          else {
            delete require.cache[require.resolve(findModelFilePath(collectionName))];
            removeModel(collectionName);
            require(findModelFilePath(collectionName));
            models = require(__base + 'models');
            res.end();
          }
        })

  })


})

router.delete('/:collection/schema/:objectId', function(req,res,next) {

  findModelSchemaFilePath(req.params.collection);

})

router.get('/*', function(req, res, next) {
  console.log(models[req.url.substr(1)]);
});

getModel = function(modelName) {
  return mongoose.model(modelName);
}

findModelFilePath = function(modelName) {
  return __base + 'models/' + modelName + '.js'
}

findModelSchemaFilePath = function(modelName) {
  return __base + 'models/' + modelName + '_Schema.js'
}

createModel = function(collectionName, res, callback) {

  var displayName = collectionName;
  var slugName = _str.slugify(collectionName);

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

//Please refactor!! =p
updateSchema = function( collectionName, res, schema, callback) {

  res.render('model_template_schema',{schema: schema }, function(err, html) {
    fs.writeFile("models/" + collectionName + "_schema.js",
      function() {
        return html;
      }(),
      function (err)
      {
        if (err) {
          console.log(err)
        }
        else {
          callback();
        }
      }
    )
  })
}

removeModel = function removeModel(modelName) {
  delete mongoose.models[modelName];
  delete mongoose.modelSchemas[modelName];
};

module.exports = router;