var blessed    = require('blessed');
var program    = blessed.program();
var logger     = require('winston');

function GameView () {
  this.screen = blessed.screen({
    autoPadding: true,
    fastCSR: true
  });
	
  this.screen.title = 'sshokoban';

  this.bodyBox = blessed.box({
    top: 'center',
    left: 'center',
    width: 80,
    height: 24,
  });

  this.lobyBox = blessed.box({
    top: 'center',
	left: 'center',
	width: 80,
	height: 24,
  });
	  
  this.gameBox = blessed.box({
    width: 45,
    height: 24,
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

  this.chatBox = blessed.box({
    right: 0,
    width: 35,
    height: 24,
    scrollable: true,
    alwaysScroll: true,
    border: {
      type: 'line'
    },
  });

  this.sessionsList = blessed.list({
    parent: this.screen, // bug
    align: "left",
    mouse: true,
    keys: true,
    style: {
        bg: 'blue',
        focus: {
          bg: 'red'
        },
        hover: {
          bg: 'red'
        }
      },
    width: "70%",
    height: "100%",
    top: "center",
    left: "left",
    border: {
      type: 'line'
    },
    items: ['plo', 'plopa']
  });
  
  this.sessionsList.select(0);
  this.sessionsList.focus();
	  
  this.bodyBox.append(this.gameBox);
  this.bodyBox.append(this.chatBox);

  this.lobyBox.append(this.sessionsList);
  this.screen.append(this.lobyBox);

  this.screen.append(this.bodyBox);

  this.bodyBox.hide();
  this.lobyBox.hide();
}

GameView.prototype.pushLine = function (line) {
  this.chatBox.pushLine(line);
};

GameView.prototype.refresh = function () {
  this.screen.render();
};

GameView.prototype.getGameViewport = function() {
  return this.gameBox;
};

GameView.prototype.getCanvas = function() {
  return program;
};

GameView.prototype.bindKey = function (key, callback) {
  this.screen.key(key, callback);
};

GameView.prototype.unbindKey = function (key, callback) {
  this.screen.unkey(key, callback);
};

module.exports = GameView;
