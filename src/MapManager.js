var tmx    = require('tmx-parser');
var _      = require('lodash');
var assert = require('assert');

// Produces errors if map object is missing something
function validate(map) {
  assert(_.has(map, 'version'), "Map has no version");
  assert.strictEqual(map.version, '1.0', "Unsupported map version");
  assert(_.has(map, 'orientation'), "Map has no orientation");
  assert.strictEqual(map.orientation, 'orthogonal', "Unsupported map orientation");
  assert(_.has(map, 'width'), "Map has no width");
  assert(_.has(map, 'height'), "Map has no height");
  assert(_.has(map, 'tileWidth'), "Map has no tileWidth");
  assert(_.has(map, 'tileHeight'), "Map has no tileHeight");
  assert(_.has(map, 'layers'), "Map has no layers");
  assert(_.isArray(map.layers), "Map layers is not an array");
  //TODO: Finish
}

// Convert a tmx map into a 2d array of tile types
function internalize(map) {
  var zippedTiles = _.zip(map.layers[1].tiles, map.layers[0].tiles);
	  
  var mergedTiles = _.map(zippedTiles, function (tiles) {
    return _.reduce(tiles, function(tileUp, tileDown) {
      return _.isUndefined(tileUp) ? tileDown : tileUp;
    });
  });
	  
  var tilesTypes = _.map(mergedTiles, function (tile) {
    return _.get(tile.properties, 'type', 'empty');
  });
  
  return _.chunk(tilesTypes, map.width);
}

function load(mapName, callback) {
  tmx.parseFile(mapName, callback);
}

function render(gameModel, gameBox, program) {
  var map            = gameModel.currentMap;
  var playerPosition = gameModel.playerPosition;
  var state          = gameModel.currentSessionState;
	
  var characters = {};
  
  characters['empty']     = {'bg': 'green', 'fg': 'white',   'character': ' '};
  characters['player']    = {'bg': 'green', 'fg': 'red',     'character': '@'};
  characters['box']       = {'bg': 'green', 'fg': 'red',     'character': '¤'};
  characters['wall']      = {'bg': 'red',   'fg': 'gray',    'character': '█'};
  characters['objective'] = {'bg': 'green', 'fg': 'white',   'character': '░'};
  characters['ok']        = {'bg': 'blue',  'fg': 'white',   'character': '░'};
  
  
  for(var y = 0; y < map.height; y++) {
    for(var x = 0; x < map.width; x++) {
      var type = state[y][x];
      
      if(x == playerPosition.x && y == playerPosition.y) {
        type = 'player';
      }
      
      if(x < gameBox.width - 2 && y < gameBox.height - 2) {
        program.move(x + gameBox.aleft + 1, y + gameBox.atop + 1);
        program.bg(characters[type].bg);
        program.fg(characters[type].fg);
        program.write(characters[type].character);
        program.bg('!' + characters[type].bg);
        program.fg('!' + characters[type].fg);
      }
    }
  }
}

module.exports.validate = validate;
module.exports.load = load;
module.exports.render = render;
module.exports.internalize = internalize;
