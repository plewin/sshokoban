// Reference path generated by VS Code for "Type definitions for Node.js" file
/// <reference path="../typings/node/node.d.ts"/>

// Node.js modules
var MapManager = require('./MapManager.js');
var GameModel  = require('./GameModel.js');
var GameView   = require('./GameView.js');
var async      = require('async');

function GameEngine() {
  this.gameModel = undefined;
  this.gameView  = new GameView();
}

GameEngine.prototype.initializeBindings = function () {
  var this_ge = this;
  
  // Add key events to the following:
  // -- Exit --
  this.gameView.bindKey(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  // -- Arrow keys --
  function process_arrow_key (ch, key) {
	var direction = key.name;
    if (this_ge.gameModel.canMovePlayer(direction)) {
      this_ge.gameModel.movePlayer(direction);
    }
    this_ge.render();
  };

  this.gameView.bindKey('left',  process_arrow_key);
  this.gameView.bindKey('right', process_arrow_key);
  this.gameView.bindKey('up',    process_arrow_key);
  this.gameView.bindKey('down',  process_arrow_key);
};

GameEngine.prototype.render = function () {
  this.gameView.refresh();
  MapManager.render(this.gameModel, this.gameView.getGameViewport(), this.gameView.getCanvas());
};

GameEngine.prototype.playLevel = function (level, callback) {
  var this_ge = this;

  var on_objective_ok = function () {
    this_ge.gameView.pushLine("Sys: One objective complete");
  };
  
  var on_game_over = function() {
    this_ge.gameView.pushLine("Sys: Game over, thanks for playing");
    callback(null, null);
  };

  var on_ready = function () {
    this_ge.gameView.pushLine("Sys: Now playing " + level);
    this_ge.render();
  }

  var on_map_loaded = function (err, map) {
    MapManager.validate(map);
	    
    this_ge.gameModel = new GameModel ();

    this_ge.gameModel.on('ready', on_ready);
    this_ge.gameModel.on('objective-ok', on_objective_ok);
    this_ge.gameModel.on('game-over', on_game_over);
  
    this_ge.gameModel.initialize(map, MapManager.internalize(map));
  }

  MapManager.load('level1.tmx', on_map_loaded);
};

GameEngine.prototype.run = function () {
  this.initializeBindings();
  
  var self = this;
  async.series([
    function (callback) {
      self.playLevel('level1', callback);
    },
    function (callback) {
      self.playLevel('level2', callback);
    }, 
  ], function (err, results) {
	
  });

};

module.exports = GameEngine;
