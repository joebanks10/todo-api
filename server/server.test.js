const expect = require('expect');
const request = require('supertest');

const { app } = require('./server');
const { Todo } = require('./models/todo');

const TODOS = [
  { text: 'Get the milk' },
  { text: 'Throw out garbage' },
  { text: 'Buy flowers' }
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

describe('GET /todos', done => {
  it('should get all todos', () => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  });
});