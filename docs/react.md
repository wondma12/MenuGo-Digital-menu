1. React State
What is State?

State is data that can change while your application is running.

Think about Facebook.

When you click Like, the number changes immediately.

Before

👍 120 Likes

After clicking

👍 121 Likes

The number changed.

That changing value is state.

Real World Example

Imagine you're creating a Coffee Shop POS System.

Initially

Cart

Coffee
Total: $5

Customer adds another coffee.

Now

Cart

Coffee
Coffee

Total: $10

The cart changed.

The total changed.

These are states.

React Example
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </>
  );
}
What happens?

Initially

count = 0

Screen

0

Click button

count = 1

React automatically updates the screen.

Another Real Example

Employee Management

Employee count

50 Employees

New employee added.

State becomes

51 Employees

Instead of refreshing the whole page, React updates only the changed value.

2. React Hooks
What are Hooks?

Hooks are special React functions that let you use React features like state, lifecycle methods, context, refs, and more inside function components.

Think of hooks as tools in a toolbox.

Imagine you're a carpenter.

Toolbox

Hammer
Screwdriver
Saw
Drill

You use each tool for a different task.

React also has tools.

useState
useEffect
useRef
useContext
useReducer
useMemo
useCallback

Each Hook solves a different problem.

Most Common Hooks
1. useState

Stores changing data.

Example

Shopping Cart

Items = 3

User adds item

Items = 4
2. useEffect

Runs code after the component renders.

Real world

Imagine opening YouTube.

The page opens.

Then videos start loading.

That loading is like useEffect.

Example

useEffect(() => {
   console.log("Component Loaded");
}, []);

Runs only once.

3. useRef

Stores something without causing a re-render.

Real example

Auto focus input.

const inputRef = useRef();

<input ref={inputRef} />
4. useContext

Shares data between components without passing props through every level.

Imagine a company.

Current logged in user

Haymanot

Every page needs

Dashboard
Profile
Settings
Employees

Instead of passing

App

↓

Dashboard

↓

Sidebar

↓

Profile

You store it once in Context.

Any component can access it.

Real Company Example

Employee Dashboard

Logged in User

↓

Dashboard

↓

Navbar

↓

Profile

Instead of passing

username

through every component, use Context.

3. API Integration

This is the most important thing in React.

What is API?

API stands for

Application Programming Interface

Think of it as a waiter in a restaurant.

Customer

I want Pizza

↓

Waiter

↓

Kitchen

↓

Pizza

↓

Waiter

↓

Customer

Pizza Delivered

The waiter is like an API.

The frontend (customer) doesn't go directly into the kitchen (database).

In Web Development
React Frontend

↓

API

↓

Node.js

↓

MySQL

React asks

Give me employees.

Backend responds

[
 {id:1,name:"John"},
 {id:2,name:"Sara"}
]

React displays the data.

Real World Employee System

Database

Employee

ID Name

1 John

2 Sara

3 Mike

React page opens.

React sends

GET /employees

Backend returns

[
  {
    "id":1,
    "name":"John"
  },
  {
    "id":2,
    "name":"Sara"
  }
]

React shows

Employees

John

Sara
React Example using Fetch
import { useEffect, useState } from "react";

function Employees() {

  const [employees, setEmployees] = useState([]);

  useEffect(() => {

    fetch("http://localhost:5000/employees")
      .then(res => res.json())
      .then(data => setEmployees(data));

  }, []);

  return (
    <div>

      {employees.map(emp => (
        <p key={emp.id}>{emp.name}</p>
      ))}

    </div>
  );
}
Flow
Component Opens

↓

useEffect runs

↓

fetch()

↓

Backend

↓

JSON Data

↓

setEmployees()

↓

State Updates

↓

Screen Updates
Another Real Example (Weather App)

User opens app.

React sends

GET /weather

API returns

{
  "city":"Addis Ababa",
  "temperature":25
}

React displays

City

Addis Ababa

Temperature

25°C
Another Example (Login)

User enters

Email

Password

Clicks Login.

React sends

POST /login

Backend checks database.

If correct

Token

React stores the token and navigates to the dashboard.

How These Concepts Work Together

Imagine a Student Management System.

Step 1: Component loads

useEffect runs.

Load students

↓

Step 2: API request
GET /students

↓

Step 3: Backend returns
[
  {
    "id":1,
    "name":"Abel"
  },
  {
    "id":2,
    "name":"Ruth"
  }
]

↓

Step 4: Save data in state
setStudents(data);

↓

Step 5: React updates the UI
Students

Abel

Ruth

The complete flow looks like this:

User opens page
        │
        ▼
React component renders
        │
        ▼
useEffect() runs
        │
        ▼
API Request (fetch/Axios)
        │
        ▼
Backend (Node.js/Express)
        │
        ▼
Database (MySQL/PostgreSQL)
        │
        ▼
Returns JSON data
        │
        ▼
setState (useState)
        │
        ▼
React re-renders
        │
        ▼
Updated UI displayed
Simple way to remember
State (useState) → "What data can change?" (e.g., cart items, employee list, login status).
Hooks → "What React tool do I need?" (useState for state, useEffect for side effects like fetching data, useContext for shared data, etc.).
API Integration → "How does my React app communicate with the backend?"