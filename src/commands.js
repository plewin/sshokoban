var _ = require('lodash');

function MovePlayer (direction) {
  this.name = 'move-player';

  this.direction = direction; 
}

MovePlayer.prototype.execute = function (gameModel) {
  gameModel.movePlayer(this.direction);
}

var parse = function (object) {
  if(object.name === 'move-player') {
    return _.extend(new MovePlayer(), object)
  }
};

module.exports = {};
module.exports.MovePlayer = MovePlayer;
module.exports.parse = parse;