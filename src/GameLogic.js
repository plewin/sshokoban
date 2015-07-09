var GameLogic = function () {
  
}

GameLogic.prototype.isTileEmpty = function (tileType) {
  return tileType == 'empty';
};

GameLogic.prototype.canMove = function (currentPos, direction, map, internalizedMap) {
  switch(direction) {
    case 'left':
      if (currentPos.x == 0) return false;
      
      var targetTile = internalizedMap[currentPos.y][currentPos.x - 1];
      
      return this.isTileEmpty(targetTile);
    case 'right':
      if (currentPos.x == map.width - 1) return false;
      
      var targetTile = internalizedMap[currentPos.y][currentPos.x + 1];

      return this.isTileEmpty(targetTile);
    case 'up':
      if (currentPos.y == 0) return false;
      
      var targetTile = internalizedMap[currentPos.y - 1][currentPos.x];
      
      return this.isTileEmpty(targetTile);
    case 'down':
      if (currentPos.y == map.height - 1) return false;
        
      var targetTile = internalizedMap[currentPos.y + 1][currentPos.x];

      return this.isTileEmpty(targetTile);
  }
};

GameLogic.prototype.move = function (currentPos, direction, map, internalizedMap) {
  switch(direction) {
    case 'left':
      currentPos.x -= 1;
      break;
    case 'right':
      currentPos.x += 1;
      break;
    case 'up':
      currentPos.y -= 1;
      break;
    case 'down':
      currentPos.y += 1;
      break;
  }
};

module.exports = new GameLogic();

