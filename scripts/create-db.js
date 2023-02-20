const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()

const challengeData = JSON.parse(fs.readFileSync('./assets/HTN_2023_BE_Challenge_Data.json', 'utf8'))
const db = new sqlite3.Database('hackers.db')


db.serialize(() => {
  console.log('Creating database and inserting default data, please wait a few seconds.')

  // Turn foreign keys on
  db.get(`PRAGMA foreign_keys = ON;`)

  // Create Hackers table
  db.run(`CREATE TABLE IF NOT EXISTS Hackers (
    hacker_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255)
  );`)

  // Create Skills table (hacker_id is a foreign key that references the Hackers table)
  db.run(`CREATE TABLE IF NOT EXISTS Skills (
    skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hacker_id INT NOT NULL,
    skill VARCHAR(255),
    rating INT,
    FOREIGN KEY (hacker_id) REFERENCES Hackers(hacker_id)
  );`)
  
  // Prepare bulk injections into tables
  const insertHackers = db.prepare(`INSERT INTO Hackers (hacker_id, name, company, email, phone) VALUES (?, ?, ?, ?, ?);`)
  const insertSkills = db.prepare(`INSERT INTO Skills (hacker_id, skill, rating) VALUES (?, ?, ?);`)

  // Iterate through challenge data to add hackers and skills
  challengeData.forEach((hacker, hackerId) => {
    insertHackers.run(hackerId+1, hacker.name, hacker.company, hacker.email, hacker.phone)
    hacker.skills.forEach(skill => {
      insertSkills.run(hackerId+1, skill.skill, skill.rating)
    })
  })

  // Finalize prepared statements to avoid resource leaks
  insertHackers.finalize()
  insertSkills.finalize()

})

// Close the database connection
db.close()
