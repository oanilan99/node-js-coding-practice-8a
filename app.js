const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "todoApplication.db");

let dataBase = null;

const initializeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/...");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1: functions
const hasPriorityAndStatusProperties = (requestQuery) => {
  return requestQuery.priority !== undefined && requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

//API 1: getting todo's based on query paramaters
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let data=null;
  let getTodosQuery = "";

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

//API 2: getting todo's based on todo_id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    id = ${todoId};`;
  const todoQuery = await dataBase.get(getTodoQuery);
  response.send(todoQuery);
});

//API 3: creates todo in todo table
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `
    INSERT INTO
    todo(id, todo, priority, status)
    VALUES(
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );`;
  await dataBase.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

/////API 4: functions
const hasStatus = (query) => {
  return query.status !== undefined;
};

const hasPriority = (query) => {
  return query.priority !== undefined;
};

const hasTodo = (query) => {
  return query.todo !== undefined;
};

//API 4: Updates the todo based on todo_id
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let updateTodoQuery = "";

  switch (true) {
    //updates todo's status
    case hasStatus(request.body):
      updateTodoQuery = `
        UPDATE
        todo
        SET
        status = '${status}'
        WHERE
        id = ${todoId};`;
      await dataBase.run(updateTodoQuery);
      response.send("Status Updated");
      break;
    //updates todo's priority
    case hasPriority(request.body):
      updateTodoQuery = `
        UPDATE
        todo
        SET
        priority = '${priority}'
        WHERE
        id = ${todoId};`;
      await dataBase.run(updateTodoQuery);
      response.send("Priority Updated");
      break;
    //updates todo's todo
    case hasTodo(request.body):
      updateTodoQuery = `
        UPDATE
        todo
        SET
        todo = '${todo}'
        WHERE
        id = ${todoId};`;
      await dataBase.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
  }
});

//API 5: deletes todo based on todo_id
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
    todo
    WHERE
    id = ${todoId};`;
  await dataBase.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
