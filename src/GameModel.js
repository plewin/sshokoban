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
  switch(direction) {
    case 'left':
      this.playerPosition.x -= 1;
      break;
    case 'right':
      this.playerPosition.x += 1;
      break;
    case 'up':
      this.playerPosition.y -= 1;
      break;
    case 'down':
      this.playerPosition.y += 1;
      break;
  }
};

module.exports = GameModel;