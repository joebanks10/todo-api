const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to database');
  }
  console.log('Successfully connected to database');

  // db.collection('Users').deleteMany({ location: 'San Jose, CA' }).then(result => {
  //   console.log(result);
  // });

  db.collection('Users').findOneAndDelete({ _id: new ObjectID('5a7f815017be1c7db9e1c234') }).then(result => {
    console.log(result);
  })

  db.close();
});