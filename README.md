# Todo API

https://warm-dawn-71976.herokuapp.com

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/86198d5ae7d868173ae1)

## Features

Implemented the following endpoints. Uses JSON Web Token for authentication.

`POST /users` Creates new user
`GET /users/me` Gets current user
`POST /users/login` Logs in user
`DELETE users/me/token` Logs out user

`GET /todos` Gets user's todos
`POST /todos` Creates a new todo
`GET /todos/:id` Gets todo with id
`PATCH /todos/:id` Updates todo with id
`DELETE /todos/:id` Deletes todo with id