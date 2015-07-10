var GameModel = function () {
  this.currentMap          = undefined;
  this.currentSessionState = undefined;
  this.playerPosition      = {x: 0, y: 0};
}


GameModel.prototype.isTileEmpty = function (tileType) {
  return tileType == 'empty';
};

GameModel.prototype.canMovePlayer = function (direction) {
  var currentPos      = this.playerPosition;

  switch(direction) {
    case 'left':
      if (currentPos.x == 0) return false;
      
      var targetTile = this.currentSessionState[currentPos.y][currentPos.x - 1];
      
      return this.isTileEmpty(targetTile);
    case 'right':
      if (currentPos.x == this.currentMap.width - 1) return false;
      
      var targetTile = this.currentSessionState[currentPos.y][currentPos.x + 1];

      return this.isTileEmpty(targetTile);
    case 'up':
      if (currentPos.y == 0) return false;
      
      var targetTile = this.currentSessionState[currentPos.y - 1][currentPos.x];
      
      return this.isTileEmpty(targetTile);
    case 'down':
      if (currentPos.y == this.currentMap.height - 1) return false;
        
      var targetTile = this.currentSessionState[currentPos.y + 1][currentPos.x];

      return this.isTileEmpty(targetTile);
  }
};

GameModel.prototype.movePlayer = function (direction) {
  var offsets = {
    'left'  : {x: -1, y:  0},
    'right' : {x: +1, y:  0},
    'up'    : {x:  0, y: -1},
    'down'  : {x:  0, y: +1},
  };
  
  var targetPosition = {
    x: this.playerPosition.x + offsets[direction].x,
    y: this.playerPosition.y + offsets[direction].y,
  };

  this.playerPosition = targetPosition;
};

module.exports = GameModel;