
function MovePlayer (direction) {
  this.name = 'move-player';

  this.direction = direction; 
}

MovePlayer.prototype.execute = function (gameModel) {
  gameModel.movePlayer(this.direction);
}

module.exports = {};
module.exports.MovePlayer = MovePlayer;
