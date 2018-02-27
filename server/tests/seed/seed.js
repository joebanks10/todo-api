const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const USERS = [
  {
    _id: userOneId,
    email: 'joeb@example.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'gaby@example.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
      }
    ]
  }
];

const TODOS = [
  { 
    _id: new ObjectID(), 
    text: 'Get the milk',
    _creator: userOneId
  },
  { 
    _id: new ObjectID(), 
    text: 'Throw out garbage',
    _creator: userTwoId
  },
  { 
    _id: new ObjectID(), 
    text: 'Buy flowers', 
    completed: true, 
    completedAt: 123,
    _creator: userOneId
  }
];

const populateTodos = done => {
  Todo.remove({})
    .then(() => Todo.insertMany(TODOS))
    .then(() => done());
};

const populateUsers = done => {
  User.remove({})
    .then(() => {
      const userOne = new User(USERS[0]).save();
      const userTwo = new User(USERS[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = {
  TODOS,
  USERS,
  populateTodos,
  populateUsers
};
