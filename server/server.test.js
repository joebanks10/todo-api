const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const { app } = require('./server');
const { Todo } = require('./models/todo');

const TODOS = [
  { _id: new ObjectID(), text: 'Get the milk' },
  { _id: new ObjectID(), text: 'Throw out garbage' },
  { _id: new ObjectID(), text: 'Buy flowers' }
];

beforeEach(done => {
  Todo.remove({})
    .then(() => Todo.insertMany(TODOS))
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test the todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
        .then(todos => {
          expect(todos.length).toBe(TODOS.length + 1);
          expect(todos[TODOS.length].text).toBe(text);
          done();
        })
        .catch(err => done(err));
      })
  });

  it('should not create a todo with invalid data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
        .then(todos => {
          expect(todos.length).toBe(TODOS.length);
          done();
        })
        .catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get a todo', done => {
    const id = TODOS[0]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end(done);
  });

  it('should return a 404 if invalid Object ID is used', done => {
    const id = '123';

    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if valid Object ID is not found', done => {
    const id = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
});