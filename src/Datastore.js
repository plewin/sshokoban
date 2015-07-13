
var r = require('rethinkdb');
var _ = require('lodash');

function Datastore () {
  this.connection = null;
};

Datastore.prototype.connect = function () {
  var self = this;
  return r.connect({host: 'localhost', port: 28015})
          .then(function(conn) {
            self.connection = conn;
          });
};

Datastore.prototype.pushCommand = function(sessiondId, command) {
  return r.table('commands')
          .insert([
            _.extend(command, {session: sessiondId})
          ])
          .run(this.connection);
};

Datastore.prototype.fetchPreviousCommands = function (sessionId) {
  return r.table('commands')
          .filter(r.row('session').eq(sessionId))
          .run(this.connection);
}

Datastore.prototype.registerCommandChanges = function (sessionId) {
  return r.table('commands')
          .filter(r.row('session').eq(sessionId))
          .changes()
          .run(this.connection)
};

Datastore.prototype.startSession = function (sessionId) {
  return r.table('commands')
          .filter({"session": sessionId})
          .delete()
          .run(this.connection);
};

Datastore.prototype.deleteSession = function (sessionId) {
  return r.table('commands')
          .filter({"session": sessionId})
          .delete()
          .run(this.connection);
};

module.exports = Datastore;
