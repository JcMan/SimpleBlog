var mongodb = require('./db');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.img = user.img;
};

module.exports = User;

User.prototype.save = function(callback){
  var i = Math.floor(Math.random()*50)+1;
  if(i<10)
    i = '0'+i;
  var user_img = 'images/userimage/h_0'+i+'.jpg';
  var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      img:user_img
  };
  mongodb.open(function (err, db){
    if (err) {
      return callback(err);
    }
    db.collection('users', function (err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user[0]);
      });
    });
  });
};

User.get = function(name, callback){
  mongodb.open(function (err, db){
    if (err) {
      return callback(err);
    }
    db.collection('users', function (err, collection){
      if (err){
        mongodb.close();
        return callback(err);
      }
      collection.findOne({
        name: name
      }, function (err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};