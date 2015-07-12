var util = require('util');
var events = require('events');
var _ = require('lodash');

var GameModel = function () {
  events.EventEmitter.call(this);

  this.currentMap          = undefined;
  this.currentSessionState = undefined;
  this.playerPosition      = {x: 0, y: 0};
};

util.inherits(GameModel, events.EventEmitter);

GameModel.prototype.initialize = function (map, sessionState) {
  this.currentMap          = map;
  this.currentSessionState = sessionState;
  this.playerPosition      = this.resetPlayerPosition();

  this.emit('ready');
};

GameModel.prototype.resetPlayerPosition = function () {
  for (var y = 0; y < this.currentMap.height; y++) {
    for (var x = 0; x < this.currentMap.width; x++) {
      if (this.currentSessionState[y][x] == 'start') {
        this.currentSessionState[y][x] = 'empty';
        //TODO: Dirty
        return {x: x, y: y};
      }
    }
  }     
};

GameModel.prototype.isTileEmpty = function (position) {
  var empty_tiles = ['empty', 'objective'];
  return empty_tiles.indexOf(this.getTileAt(position)) >= 0;
};

GameModel.prototype.isTilePushable = function (position, direction) {
  var targetPosition = this.findNextPosition(position, direction);
  var pushableTiles  = ['box', 'ok'];
  
  if (this.isPositionInCurrentMap(position)) {
	  var tile = this.getTileAt(position);
	  return pushableTiles.indexOf(tile) >= 0 && this.isTileEmpty(targetPosition);
  } else {
	  return false;
  }
};

GameModel.prototype.getTileAt = function (position) {
  return this.currentSessionState[position.y][position.x];
};

GameModel.prototype.setTileAt = function (position, tileType) {
  this.currentSessionState[position.y][position.x] = tileType;
};

GameModel.prototype.canMovePlayer = function (direction) {
  var targetPosition = this.findNextPosition(this.playerPosition, direction);

  if (this.isPositionInCurrentMap(targetPosition)) {
	  return this.isTileEmpty(targetPosition) || this.isTilePushable(targetPosition, direction);
  } else {
	  return false;
  }
};

GameModel.prototype.isGameOver = function () {
  return _.filter(_.flatten(this.currentSessionState), function(tile) { return tile == 'objective'}).length == 0;
}

// must call canMovePlayer otherwise undefined behavior
GameModel.prototype.movePlayer = function (direction) {
  var targetPosition = this.findNextPosition(this.playerPosition, direction);
  
  
  if (!this.isTileEmpty(targetPosition)) {
    // not empty -> something pushable to push 
    var newObjectPosition = this.findNextPosition(targetPosition, direction);
    
    if (this.getTileAt(newObjectPosition) == 'objective') {
      this.setTileAt(newObjectPosition, 'ok');
      
      this.emit('objective-ok', newObjectPosition);
      if (this.isGameOver()) {
        this.emit('game-over');
      }
    } else {
      this.setTileAt(newObjectPosition, 'box');
    }
    
    if (this.getTileAt(targetPosition) == 'ok') {
      this.setTileAt(targetPosition, 'objective');
    } else {
      this.setTileAt(targetPosition, 'empty');
    }
    
    
  }
  this.playerPosition = targetPosition;
};

GameModel.prototype.findNextPosition = function (position, direction) {
  var offsets = {
    'left'  : {x: -1, y:  0},
    'right' : {x: +1, y:  0},
    'up'    : {x:  0, y: -1},
    'down'  : {x:  0, y: +1},
  };

  var targetPosition = {
    x: position.x + offsets[direction].x,
    y: position.y + offsets[direction].y,
  };

  return targetPosition;
}

GameModel.prototype.isPositionInCurrentMap = function (position) {
  var is_valid_on_x = position.x >= 0 && position.x < this.currentMap.width;
  var is_valid_on_y = position.y >= 0 && position.y < this.currentMap.height;
  return is_valid_on_x && is_valid_on_y;
}

module.exports = GameModel;
