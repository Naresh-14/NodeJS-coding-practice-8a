const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'todoApplication.db')

const app = express()
app.use(express.json())

let db = null

const initializeDBObjectAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}
initializeDBObjectAndServer()

app.get('/todos/', async (request, response) => {
  const {status = 'TO%20DO'} = request.query
  const getTodosQuery = `
  SELECT * FROM todo
  WHERE 
    status LIKE '${status}';
  `
  const todosArray = await db.all(getTodosQuery)
  response.send(todosArray)
})

const hasPriorityAndStatuProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperties = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperties = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatuProperties:
      getTodosQuery = `
    SELECT * 
    FROM todo
    WHERE 
      todo LIKE '%${search_q}%'
      AND priority = '${priority}'
      AND status = '${status}';
    `
      break
    case hasPriorityProperties:
      getTodosQuery = `
    SELECT * 
    FROM todo
    WHERE
      todo LIKE '%${search_q}%'
      AND priority = '${priority}';
    `
      break
    case hasStatusProperties:
      getTodosQuery = `
    SELECT * 
    FROM todo
    WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';
    `
      break
    default:
      getTodosQuery = `
    SELECT * 
    FROM todo
    WHERE 
    todo LIKE '%${search_q}%';
    `
  }
  data = await db.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
  SELECT *
  FROM todo
  WHERE 
    id = ${todoId};
  `
  const todo = await db.all(getTodoQuery)
  response.send(todo)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body

  const addTodosQuery = `
  INSERT INTO todo (id,todo,priority,status)
  VALUES 
   (${id},'${todo}','${priority}','${status}');
  `
  await db.run(addTodosQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`
  const previousTodo = await database.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`

  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoDeleteQuery = `
  DELETE FROM todo
  WHERE
    id = ${todoId};
  `
  await db.run(todoDeleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
