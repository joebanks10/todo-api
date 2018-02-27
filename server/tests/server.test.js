const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { TODOS, USERS, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const user = USERS[0];
    const text = 'Test the todo text';

    request(app)
      .post('/todos')
      .set('x-auth', user.tokens[0].token)
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
    const user = USERS[0];

    request(app)
      .post('/todos')
      .set('x-auth', user.tokens[0].token)
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
    const user = USERS[0];

    request(app)
      .get('/todos')
      .set('x-auth', user.tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  const user = USERS[0];

  it('should get a todo', done => {
    const id = TODOS[0]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end(done);
  });

  it('should return a 404 if user is not todo creator', done => {
    const id = TODOS[1]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if invalid Object ID is used', done => {
    const id = '123';

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if valid Object ID is not found', done => {
    const id = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE todos/:id', () => {
  const user = USERS[0];

  it('should delete todo', done => {
    const id = TODOS[0]._id.toHexString();

    request(app).delete(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id)
        .then(todo => {
          expect(todo).toBeFalsy();
        })
        .then(() => Todo.find())
        .then(todos => {
          expect(todos.length).toBe(2);
          done();
        })
        .catch(e => done(err));
      });
  });

  it('should not delete todo owned by another user', done => {
    const id = TODOS[1]._id.toHexString();

    request(app).delete(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id)
          .then(todo => {
            expect(todo).toBeTruthy();
          })
          .then(() => Todo.find())
          .then(todos => {
            expect(todos.length).toBe(3);
            done();
          })
          .catch(e => done(err));
      });
  });

  it('should return a 404 if invalid Object ID is used', done => {
    const id = '123';

    request(app).delete(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if valid Object ID is not found', done => {
    const id = new ObjectID().toHexString();

    request(app).delete(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  const user = USERS[0];

  it('should complete a todo', done => {
    const id = TODOS[0]._id.toHexString();

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .send({ text: 'Build website', completed: true })
      .expect(200)
      .expect(res => {
        const { todo } = res.body;
        
        expect(todo._id).toBe(id);
        expect(todo.completed).toBe(true);
        expect(typeof todo.completed).toBe('boolean');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id)
        .then(todo => {
          expect(todo.text).toBe('Build website');
          expect(todo.completed).toBe(true);
          done();
        })
        .catch(e => done(e));
      });
  });

  it('should remove complete status from todo', done => {
    const id = TODOS[2]._id.toHexString();

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .send({ completed: false })
      .expect(200)
      .expect(res => {
        const { todo } = res.body;

        expect(todo._id).toBe(id);
        expect(todo.completed).toBe(false);
        expect(todo.completedAt).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id)
          .then(todo => {
            expect(todo.completed).toBe(false);
            expect(todo.completedAt).toBeFalsy();
            done();
          })
          .catch(e => done(e));
      })
  });

  it('should not complete a todo if user is not creator', done => {
    const id = TODOS[1]._id.toHexString();

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', user.tokens[0].token)
      .send({ text: 'Build website', completed: true })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id)
          .then(todo => {
            expect(todo.text).toEqual(TODOS[1].text);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    const user = USERS[0];

    request(app).get('/users/me')
      .set('x-auth', user.tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(user._id.toHexString());
        expect(res.body.email).toBe(user.email);
      })
      .end(done);    
  });

  it('should return 401 if not authenticated', (done) => {
    request(app).get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create new user', done => {
    const email = 'joe@example.com';
    const password = 'mypassword';

    request(app).post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email }).then(user => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        })
        .catch(e => done(e));
      });
  });

  it('should return error if invalid email', done => {
    const email = 'blah';
    const password = 'mypassword';

    request(app).post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should return error if invalid password', done => {
    const email = 'joe@example.com';
    const password = 'x';

    request(app).post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should not create user if email is taken', done => {
    const email = USERS[0].email;
    const password = 'mypassword';

    request(app).post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user with valid credentials', (done) => {
    const user = USERS[0];
    const { email, password } = user;

    request(app).post('/users/login')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(user._id.toHexString());
        expect(res.body.email).toBe(user.email);
        expect(res.header['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(user._id).then(user => {
          expect(user).toBeTruthy();
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.header['x-auth']
          });
          done();
        })
        .catch(e => done(e));
      });
  });

  it('should reject login request with invalid password', (done) => {
    const user = USERS[0];
    const { email } = user;
    const password = 'invalidpassword';

    request(app).post('/users/login')
      .send({ email, password })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(user._id).then(user => {
          expect(user.tokens.length).toBe(1);
          done();
        })
        .catch(e => done(e));
      });
  });

  it('should reject login request with invalid email', (done) => {
    const email = 'nobody@example.com';
    const password = 'nobodyspassword';

    request(app).post('/users/login')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('DELETE /users/me/token', () => {
  it('should delete token', (done) => {
    const user = USERS[0];
    const token = user.tokens[0].token;

    request(app).delete('/users/me/token')
      .set('x-auth', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(user._id).then(user => {
          expect(user).toBeTruthy();
          expect(user.tokens.length).toBe(0);
          done();
        })
        .catch(e => done());
      });
  });
});
