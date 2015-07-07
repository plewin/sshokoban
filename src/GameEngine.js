var MapManager = require('./MapManager.js');
var blessed    = require('blessed');
var program    = blessed.program();
var async      = require('async'); 

function GameEngine() {
  this.screen = blessed.screen({
    autoPadding: true,
    smartCSR: true
  });

  this.currentMap          = undefined;
  this.currentSessionState = undefined;
  this.playerPosition      = {x: 0, y: 0};

  this.screen.title = 'sshokoban';
  
  this.gameBox = blessed.box({
    top: 'center',
    left: 'center',
    width: 80,
    height: 25,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      border: {
        fg: '#f0f0f0'
      },
    }
  });
}
GameEngine.prototype.initializeBindings = function () {
  this.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  var this_ge = this;
  
  this.screen.key('left', function(ch, key) {
	this_ge.playerPosition.x -= 1;
    this_ge.render();
  });
  this.screen.key('right', function(ch, key) {
    this_ge.playerPosition.x += 1;
    this_ge.render();
  });
  this.screen.key('up', function(ch, key) {
    this_ge.playerPosition.y -= 1;
    this_ge.render();
  });
  this.screen.key('down', function(ch, key) {
    this_ge.playerPosition.y += 1;
    this_ge.render();
  });
};

GameEngine.prototype.render = function () {
  this.screen.render();
  MapManager.render(this.currentMap, this.playerPosition, this.currentSessionState, this.gameBox, program);
};

GameEngine.prototype.resetPlayerPosition = function () {
  for (var y = 0; y < this.currentMap.height; y++) {
    for (var x = 0; x < this.currentMap.width; x++) {
      if (this.currentSessionState[y][x] == 'start') {
        this.currentSessionState[y][x] = 'empty';
        //TODO dirty
        return {x: x, y: y};
      }
    }
  }     
}

GameEngine.prototype.run = function () {
  this.initializeBindings();
  this.screen.append(this.gameBox);
  
  var this_ge = this;
  
  MapManager.load('level1.tmx', function(err, map) {
    MapManager.validate(map);
    this_ge.currentMap = map;
    this_ge.currentSessionState = MapManager.internalize(map);
    this_ge.playerPosition = this_ge.resetPlayerPosition()
    this_ge.render();
  });
};

module.exports = GameEngine;