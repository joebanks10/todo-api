const { MongoClient } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to database');
  }
  console.log('Successfully connected to database');

  db.collection('Todos').find({completed: false}).toArray().then(docs => {
    console.log('Todos');
    console.log(JSON.stringify(docs, undefined, 2));
  }, err => {
    console.log('Unable to find todos');
  });

  db.collection('Todos').find().count().then(count => {
    console.log(`Todos count: ${count}`);
  }, err => {
    console.log('Unable to find todos');
  });

  db.close();
});