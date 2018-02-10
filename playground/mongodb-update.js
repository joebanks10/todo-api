const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to database');
  }
  console.log('Successfully connected to database');

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5a7f812b17be1c7db9e1c222')
  }, {
    $set: {
      name: 'Joe'
    },
    $inc: {
      age: 1
    }
  }, {
    returnOriginal: false
  })
  .then(result => console.log(result));

  db.close();
});