// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-flow"]
});

process.argv.splice(2).forEach(function(scriptName) {
  module.exports = require("./" + scriptName + ".js");
});
