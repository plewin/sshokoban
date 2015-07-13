// Reference path generated by VS Code for "Type definitions for Node.js" file
/// <reference path="../typings/node/node.d.ts"/>

// Node.js modules
var MapManager = require('./MapManager.js');
var GameModel  = require('./GameModel.js');
var GameView   = require('./GameView.js');
var Datastore  = require('./Datastore.js');
var commands   = require('./commands.js');
var async      = require('async');
var _          = require('lodash');

function GameEngine() {
  this.gameModel = undefined;
  this.gameView  = new GameView();

  this.datastore = new Datastore();

  this.pendingCommands = [];
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
      this_ge.pushCommand(new commands.MovePlayer(direction), function () {
        this_ge.render();
      });
    } else {
      this_ge.render();
    }
    
  };

  this.gameView.bindKey('left',  process_arrow_key);
  this.gameView.bindKey('right', process_arrow_key);
  this.gameView.bindKey('up',    process_arrow_key);
  this.gameView.bindKey('down',  process_arrow_key);
};

GameEngine.prototype.pushCommand = function (command, callback) {
  this.datastore.pushCommand(1, command).then(function(result) {
    callback();
  });
};

GameEngine.prototype.render = function () {
  var self = this;

  _.forEach(this.pendingCommands, function(command) {
    command.execute(self.gameModel); 
  });
  //TODO fix race condition
  this.pendingCommands = [];

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
    
    this_ge.datastore.deleteSession(1).then(function(result) {       
      callback(null, null);
    });
  };

  var on_ready = function () {
    this_ge.gameView.pushLine("Sys: Now playing " + level);
    this_ge.render(); // render at least once
    
    var queue_commands = function (commands) {
      _.forEach(commands, function(command) {
        this_ge.pendingCommands.push(commands.parse(command));
      });
    };
    
    var apply_commands = function () {
      this_ge.render();
    };
    
    var register_command_stream = function (cursor) {
      cursor.each(function(err, row) {
        if (err) throw err;
        this_ge.pendingCommands.push(commands.parse(row['new_val']));
        this_ge.render();
      });
    };
    
    this_ge.datastore.fetchPreviousCommands(1)
      .then(function(cursor) {
        cursor.toArray()
              .then(queue_commands)
              .then(apply_commands);
      })
      .then(function() {
        this_ge.datastore.registerCommandChanges(1)
                         .then(register_command_stream);
      });
  };

  var on_map_loaded = function (err, map) {
    MapManager.validate(map);
	    
    this_ge.gameModel = new GameModel ();

    this_ge.gameModel.on('ready', on_ready);
    this_ge.gameModel.on('objective-ok', on_objective_ok);
    this_ge.gameModel.on('game-over', on_game_over);
    
    this_ge.datastore.startSession(1).then(function(result) {
      this_ge.gameModel.initialize(map, MapManager.internalize(map));
    });
  };

  MapManager.load('level1.tmx', on_map_loaded);
};

GameEngine.prototype.run = function () {
  this.initializeBindings();
  
  var self = this;
  async.series([
    function (callback) {
      self.datastore.connect().then(function() { callback(null, null) });
    },
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
