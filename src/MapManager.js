var tmx    = require('tmx-parser');
var _      = require('lodash');
var assert = require('assert');

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
  //TODO finish
}

function internalize(map) {
  var zipped_tiles = _.zip(map.layers[1].tiles, map.layers[0].tiles);
	  
  var merged_tiles = _.map(zipped_tiles, function (tiles) {
    return _.reduce(tiles, function(tileUp, tileDown) {
      return _.isUndefined(tileUp) ? tileDown : tileUp;
    });
  });
	  
  var tiles_types = _.map(merged_tiles, function (tile) {
    return _.get(tile.properties, 'type', 'empty');
  });
  
  return _.chunk(tiles_types, map.width);
}

function load(map_name, callback) {
  tmx.parseFile(map_name, callback);
}

function render(map, playerPosition, state, game_box, program) {
  var characters = {};
  
  characters['empty']     = {'bg': 'green', 'character': ' '};
  characters['player']    = {'bg': 'green', 'character': '@'};
  characters['box']       = {'bg': 'green', 'character': '¤'};
  characters['wall']      = {'bg': 'red', 'character': '█'};
  characters['objective'] = {'bg': 'green', 'character': '░'};
  
  
  for(var y = 0; y < map.height; y++) {
    for(var x = 0; x < map.width; x++) {
      var type = state[y][x];
      
      if(x == playerPosition.x && y == playerPosition.y) {
        type = 'player';
      }
      
      if(x < game_box.width - 2 && y < game_box.height - 2) {
        program.move(x + game_box.aleft + 1, y + game_box.atop + 1);
        program.bg(characters[type].bg);
        program.write(characters[type].character);
        program.bg('!' + characters[type].bg);
      }
    }
  }
  
}

module.exports.validate = validate;
module.exports.load = load;
module.exports.render = render;
module.exports.internalize = internalize;


