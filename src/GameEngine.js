// Reference path generated by VS Code for "Type definitions for Node.js" file
/// <reference path="../typings/node/node.d.ts"/>

// Node.js modules
var MapManager = require('./MapManager.js');
var GameModel  = require('./GameModel.js');
var GameView   = require('./GameView.js');
var Datastore  = require('./Datastore.js');
var commands   = require('./commands.js');
var logger     = require('winston');
var async      = require('async');
var _          = require('lodash');

logger.level = 'warning';

function GameEngine() {
  this.gameModel = undefined;
  this.gameView  = new GameView();

  this.datastore = new Datastore();

  this.pendingCommands = [];
}

GameEngine.prototype.initializeBindings = function () {
  logger.info("Initializing bindings");

  var this_ge = this;
  
  this.gameView.bindKey(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });
};

GameEngine.prototype.initializeGamzBindings = function () {
  var this_ge = this;

  // -- Arrow keys --
  function process_arrow_key (ch, key) {
    logger.debug("Key %s pressed", key.name);
	var direction = key.name;
    if (this_ge.gameModel.canMovePlayer(direction)) {
      this_ge.pushCommand(new commands.MovePlayer(direction), function () {
        this_ge.render();
      });
    } else {
      this_ge.render();
    }
    
  };

  this.processArrowKey = process_arrow_key;

  this.gameView.bindKey('left',  this.processArrowKey);
  this.gameView.bindKey('right', this.processArrowKey);
  this.gameView.bindKey('up',    this.processArrowKey);
  this.gameView.bindKey('down',  this.processArrowKey);
};

GameEngine.prototype.pushCommand = function (command, callback) {
  this.datastore.pushCommand(command).then(function(result) {
    callback();
  });
};

GameEngine.prototype.render = function () {
  logger.debug('Rendering');
  var self = this;

  _.forEach(this.pendingCommands, function(command) {
    command.execute(self.gameModel); 
  });
  //TODO fix race condition
  this.pendingCommands = [];

  this.gameView.refresh();
  MapManager.render(this.gameModel, this.gameView.getGameViewport(), this.gameView.getCanvas());
};

GameEngine.prototype.joinLevel = function (sessionId, callback) {
  logger.info('Joining session %s', sessionId);
  var this_ge = this;
 
  this.gameView.bodyBox.show();
  //this.initializeGamzBindings();

  var on_objective_ok = function () {
    logger.debug('One objective complete');
    this_ge.gameView.pushLine("Sys: One objective complete");
  };
  
  var on_game_over = function() {
    logger.debug('Game over');
    this_ge.gameView.pushLine("Sys: Game over, thanks for playing");
  };

  var on_ready = function () {
    logger.debug('Game ready');
    this_ge.gameView.pushLine("Sys: Now watching");
    this_ge.render(); // render at least once
    
    var queue_commands = function (reveived_commands) {
      _.forEach(reveived_commands, function(command) {
        this_ge.pendingCommands.push(commands.parse(command));
      });
    };
    
    var apply_commands = function () {
      this_ge.render();
    };
    
    var register_command_stream = function (cursor) {
      cursor.each(function(err, row) {
        if (err) throw err;
        if(row['new_val'] != null && row['old_val'] == null) {
          this_ge.pendingCommands.push(commands.parse(row['new_val']));
          this_ge.render();	
        }
      });
    };
    
    this_ge.datastore.fetchPreviousCommands(sessionId)
      .then(function(cursor) {
        cursor.toArray()
              .then(queue_commands)
              .then(apply_commands);
      })
      .then(function() {
        this_ge.datastore.registerCommandChanges(sessionId)
                         .then(register_command_stream);
      });
  };

  var on_map_loaded = function (err, map) {
    MapManager.validate(map);
    logger.debug('Map loaded successfully');
	    
    this_ge.gameModel = new GameModel ();

    this_ge.gameModel.on('ready', on_ready);
    this_ge.gameModel.on('objective-ok', on_objective_ok);
    this_ge.gameModel.on('game-over', on_game_over);
    
    this_ge.gameModel.initialize(map, MapManager.internalize(map));
  };

  MapManager.load('level1.tmx', on_map_loaded);
};

GameEngine.prototype.playLevel = function (level, callback) {
  logger.info('Playing level %s', level);
  var this_ge = this;

  this.gameView.bodyBox.show();
  this.initializeGamzBindings();

  var on_objective_ok = function () {
    logger.debug('One objective complete');
    this_ge.gameView.pushLine("Sys: One objective complete");
  };
  
  var on_game_over = function() {
    logger.debug('Game over');
    this_ge.gameView.pushLine("Sys: Game over, thanks for playing");
    
    this_ge.datastore.deleteCurrentSession().then(function(result) {
      this_ge.gameView.bodyBox.hide();
      this_ge.gameView.refresh();
      this_ge.gameView.unbindKey('left',  this.processArrowKey);
      this_ge.gameView.unbindKey('right', this.processArrowKey);
      this_ge.gameView.unbindKey('up',    this.processArrowKey);
      this_ge.gameView.unbindKey('down',  this.processArrowKey);
      callback(null, null);
    });
  };

  var on_ready = function () {
    logger.debug('Game ready');
    this_ge.gameView.pushLine("Sys: Now playing " + level);
    this_ge.render(); // render at least once
    
    var queue_commands = function (reveived_commands) {
      _.forEach(reveived_commands, function(command) {
        this_ge.pendingCommands.push(commands.parse(command));
      });
    };
    
    var apply_commands = function () {
      this_ge.render();
    };
    
    var register_command_stream = function (cursor) {
      cursor.each(function(err, row) {
        if (err) throw err;
        if(row['new_val'] != null && row['old_val'] == null) {
          this_ge.pendingCommands.push(commands.parse(row['new_val']));
          this_ge.render();	
        }
      });
    };
    
    this_ge.datastore.fetchPreviousCommands()
      .then(function(cursor) {
        cursor.toArray()
              .then(queue_commands)
              .then(apply_commands);
      })
      .then(function() {
        this_ge.datastore.registerCommandChanges()
                         .then(register_command_stream);
      });
  };

  var on_map_loaded = function (err, map) {
    MapManager.validate(map);
    logger.debug('Map loaded successfully');
	    
    this_ge.gameModel = new GameModel ();

    this_ge.gameModel.on('ready', on_ready);
    this_ge.gameModel.on('objective-ok', on_objective_ok);
    this_ge.gameModel.on('game-over', on_game_over);
    
    this_ge.datastore.startCurrentSession().then(function(result) {
      this_ge.gameModel.initialize(map, MapManager.internalize(map));
    });
  };

  MapManager.load('level1.tmx', on_map_loaded);
};

GameEngine.prototype.displayHome = function (callback) {
  var self = this;

  this.gameView.lobyBox.show();
  
  
  this.datastore.listSessions().then(function (results) {
    results.toArray().then(function(rows) {
      var currentSessions = _.map(rows, function(row) {
        var short_id = row.id.split('-')[0];   
        return short_id + " " + row.start.toISOString() + " player:" + row.player;
      });

      self.gameView.sessionsList.setItems(currentSessions);
      self.gameView.refresh();
      
      self.gameView.sessionsList.on('select', function(elem, index) {
    	self.gameView.lobyBox.hide();
        callback(null, {type: 'join', sessionId: rows[index].id});
      });
      
      self.gameView.newGameButton.on('press', function() {
    	callback(null, {type: 'new-game'});
      });
    });
  });
};

GameEngine.prototype.run = function () {
  logger.debug('Running game engine');
  
  var self = this;

  this.datastore.connect()
      .then(function() {
        self.initializeBindings();
        self.displayHome(function(err, ask) {
          if(ask.type == 'new-game') {
            self.playLevel('level1', function() { console.log("finish"); });
          } else if(ask.type == 'join') {
            self.joinLevel(ask.sessionId, function() { console.log("finish"); }); 
          }
        });
      });
};

module.exports = GameEngine;
