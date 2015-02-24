var normalizedPath = require("path").join(__base, "models");
var modules = {};

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    if (file != "Index.js" && file.indexOf('_Schema') <= 0) {
        modules[file.split('.')[0]] = require('./' + file);
    }
});
module.exports = modules;