var blessed    = require('blessed');
var program    = blessed.program();

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
	  
  this.bodyBox.append(this.gameBox);
  this.bodyBox.append(this.chatBox);
	  
  this.screen.append(this.bodyBox);
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

module.exports = GameView;
