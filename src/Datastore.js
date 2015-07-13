
var r = require('rethinkdb');
var _ = require('lodash');

function Datastore () {
  this.connection = null;
  this.sessionId = null;
};

Datastore.prototype.connect = function () {
  var self = this;
  return r.connect({host: 'localhost', port: 28015})
          .then(function(conn) {
            self.connection = conn;
          });
};

Datastore.prototype.pushCommand = function(command) {
  return r.table('commands')
          .insert(_.extend(command, {session: this.sessionId}))
          .run(this.connection);
};

Datastore.prototype.fetchPreviousCommands = function () {
  return r.table('commands')
          .filter(r.row('session').eq(this.sessionId))
          .run(this.connection);
}

Datastore.prototype.registerCommandChanges = function () {
  return r.table('commands')
          .filter(r.row('session').eq(this.sessionId))
          .changes()
          .run(this.connection)
};

Datastore.prototype.startCurrentSession = function () {
  var self = this;
  return r.table('sessions')
    .insert({player: 'tapz'})
    .run(this.connection)
    .then(function (result) {
      self.sessionId = result.generated_keys[0];
    })
    .then(function() {
      return r.table('commands')
              .filter({"session": self.sessionId})
              .delete()
              .run(self.connection);
    });
};

Datastore.prototype.deleteCurrentSession = function () {
  var self = this;
  return r.table('sessions')
          .get(this.sessionId)
          .delete()
          .run(this.connection)
          .then(function() {
            return r.table('commands')
                    .filter({"session": self.sessionId})
                    .delete()
                    .run(self.connection);
          });
};

module.exports = Datastore;
