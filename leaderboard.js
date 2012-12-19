// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");


var killPattern = /\s+(\S+)\s+killed\s+(\S+)\s+/;

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  var require  = __meteor_bootstrap__.require
  var spawn = require('child_process').spawn;
  Meteor.startup(function () {
    Players.remove({});
    var tail = spawn("tail", ["-f", '/tmp/games.log']);
    tail.stdout.on("data", function (data) {
      
      Fiber(function(){
      txt = data.toString();

        if (txt.indexOf("MOD_CHANGE_TEAM")!=-1){
          return;
        }
        var kmatch = killPattern.exec(txt);
        if (kmatch){
          var killer = kmatch[1];
          var victim = kmatch[2];
          console.log(killer + " -> " + victim);
          if (Players.find({name:killer}).count()==0) {
            Players.insert({name:killer,score:0});
          }
          Players.update({name:killer},{$inc:{score:1}});
          if (Players.find({name:victim}).count()==0){
            Players.insert({name:victim,score:0});
          }
          Players.update({name:victim},{$inc:{score:-1}});
        }
      }).run();
    }); 
  });
}
