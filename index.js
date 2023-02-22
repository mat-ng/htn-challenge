const express = require('express')
const sqlite3 = require('sqlite3')

const app = express()
const db = new sqlite3.Database('hackers.db')
const port = 3000

app.use(express.json())

// All Users Endpoint
app.get('/hackers', (req, res) => {
  db.all(`
    SELECT Hackers.name, Hackers.company, Hackers.email, Hackers.phone, json_group_array(json_object('skill', Skills.skill, 'rating', Skills.rating)) AS skills
    FROM Hackers
    JOIN Skills ON Hackers.hacker_id = Skills.hacker_id
    GROUP BY Hackers.hacker_id
  `, [], (err, rows) => {

    if (err) {
      return console.error(err.message)
    }

    if (!rows) {
      return res.send('No hackers found.')
    }

    // SQLite returns strings, so convert the data to JSON
    rows.forEach(row => {
      row.skills = JSON.parse(row.skills)
    })
    return res.send([...rows])
  })
})

// User Information Endpoint
app.get('/hackers/:id', (req, res) => {
  db.get(`
    SELECT Hackers.name, Hackers.company, Hackers.email, Hackers.phone, json_group_array(json_object('skill', Skills.skill, 'rating', Skills.rating)) AS skills
    FROM Hackers
    JOIN Skills ON Hackers.hacker_id = Skills.hacker_id
    WHERE Hackers.hacker_id = '${req.params.id}'
    GROUP BY Hackers.hacker_id
  `, [], (err, row) => {

    if (err) {
      return console.error(err.message)
    }

    if (!row) {
      return res.send('No hacker found with that id.')
    }

    // SQLite returns strings, so convert the data to JSON
    row.skills = JSON.parse(row.skills)
    return res.send(row)
  })
})

// Updating User Data Endpoint
app.put('/hackers/:id', (req, res) => {
  db.serialize(() => {
    // Filter through request body for name, company, email, phone
    const newInfoRequested = (({ name, company, email, phone }) => ({ name, company, email, phone }))(req.body)
    const newInfoToUpdate = Object.values(newInfoRequested).filter(n => n)
    
    // Filter through request body for skills with ratings
    const newSkills =  (({ skills }) => ( skills.filter(skill => (Object.keys(skill).length == 2 && skill.skill && Number.isInteger(skill.rating)))))(req.body)

    db.run(`
      UPDATE Hackers
      SET ${newInfoRequested.name ? 'name = ?, ' : ''}
          ${newInfoRequested.company ? 'company = ?, ' : ''}
          ${newInfoRequested.email ? 'email = ?, ' : ''}
          ${newInfoRequested.phone ? 'phone = ?, ' : ''}
          hacker_id = hacker_id
      WHERE hacker_id = '${req.params.id}'
    `, newInfoToUpdate, err => { if (err) { return console.error(err.message) } })

    // Only update skills if request body included new skills
    if (newSkills.length > 0) {
      db.run(`DELETE FROM Skills WHERE hacker_id = '${req.params.id}'`, [], err => { if (err) { return console.error(err.message) } })
      newSkills.forEach(skill => {
        db.run(`INSERT INTO Skills (hacker_id, skill, rating) VALUES (${req.params.id}, '${skill.skill}', ${skill.rating})`, [], err => { if (err) { return console.error(err.message) } })
      })
    }

    // Return full updated user data
    db.get(`
      SELECT Hackers.name, Hackers.company, Hackers.email, Hackers.phone, json_group_array(json_object('skill', Skills.skill, 'rating', Skills.rating)) AS skills
      FROM Hackers
      JOIN Skills ON Hackers.hacker_id = Skills.hacker_id
      WHERE Hackers.hacker_id = '${req.params.id}'
      GROUP BY Hackers.hacker_id
    `, [], (err, row) => {

      if (err) {
        return console.error(err.message)
      }

      if (!row) {
        return res.send('No hacker found with that id.')
      }

      row.skills = JSON.parse(row.skills)
      return res.send(row)
    })
  })
})

// Skills Endpoints
app.get('/skills', (req, res) => {
  const { min_frequency, max_frequency } = req.query

  if (!Number.isInteger(parseInt(min_frequency)) || !Number.isInteger(parseInt(max_frequency))) {
    return res.send('Please enter valid frequencies.')
  }

  db.all(`
    SELECT skill, COUNT(hacker_id) as frequency
    FROM Skills
    GROUP BY skill
    HAVING COUNT(hacker_id) BETWEEN ${min_frequency} AND ${max_frequency}
    ORDER BY frequency
  `, [], (err, rows) => {

    if (err) {
      return console.error(err.message)
    }

    return res.send(rows)
  })
})

// BONUS ENDPOINT: Hacker Contact Info
app.get('/contact', (req, res) => {
  const { name } = req.query
  
  db.get(`
    SELECT email, phone
    FROM Hackers
    WHERE Hackers.name = '${name}'
  `, [], (err, row) => {

    if (err) {
      return console.error(err.message)
    }

    if (!row) {
      return res.send('No hacker found with that name.')
    }

    return res.send(row)
  })
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
