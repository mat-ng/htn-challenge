import express from 'express'
import sqlite3 from 'sqlite'

const app = express()
const port = 3000

// Create a database if none exists
const database = new sqlite3.Database("hackers.db")

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(port, () => {
  console.log(`Example REST Express app listening at http://localhost:${port}`)
})
