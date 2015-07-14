
var r      = require('rethinkdb');
var _      = require('lodash');
var logger = require('winston');

function Datastore() {
  this.connection = null;
  this.sessionId = null;
  this.changesCursor = null;
};

Datastore.prototype.listSessions = function() {
  return r.table('sessions')
    .run(this.connection);
};

Datastore.prototype.connect = function() {
  var _this = this;

  return r.connect({host: 'localhost', port: 28015})
    .then(function saveConnection(conn) {
      _this.connection = conn;
    });
};

Datastore.prototype.pushCommand = function(command) {
  return r.table('commands')
    .insert(_.extend(command, {session: this.sessionId}))
    .run(this.connection);
};

Datastore.prototype.fetchPreviousCommands = function(sessionId) {
  var _sessionId = sessionId == undefined ? this.sessionId : sessionId;

  return r.table('commands')
    .filter(r.row('session').eq(_sessionId))
    .run(this.connection);
}

Datastore.prototype.registerCommandChanges = function(sessionId) {
  var _sessionId = (sessionId == undefined) ? this.sessionId : sessionId;
  var _this = this;

  return r.table('commands')
    .filter(r.row('session').eq(_sessionId))
    .changes()
    .run(this.connection)
    .then(function(cursor) {
      _this.changesCursor = cursor;
      return cursor;
    });
};

Datastore.prototype.startCurrentSession = function() {
  var _this = this;

  return r.table('sessions')
    .insert({player: 'tapz', map: 'level1.tmx', start: new Date()})
    .run(this.connection)
    .then(function saveGameSessionId(result) {
      _this.sessionId = result.generated_keys[0];
    })
    .then(function() {
      return r.table('commands')
        .filter({"session": _this.sessionId})
        .delete()
        .run(_this.connection);
    });
};

Datastore.prototype.deleteCurrentSession = function() {
  var _this = this;

  return r.table('sessions')
    .get(this.sessionId)
    .delete()
    .run(this.connection)
    .then(function closeChangesCursor() {
      if(_this.changesCursor != null) {
        _this.changesCursor.close();
        _this.changesCursor = null;
      }
    })
    .then(function() {
      return r.table('commands')
        .filter({"session": _this.sessionId})
        .delete()
        .run(_this.connection);
    });
};

module.exports = Datastore;
