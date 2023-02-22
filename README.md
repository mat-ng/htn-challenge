# Matthew Ng's Hack the North Backend Challenge 2023

## Setup

Step 1: After cloning the repository, install the necessary packages by running in your terminal:

```
npm install
```

Step 2: Create the database and insert default data by running in your terminal (it might take a few seconds to complete):

```
npm run create-db
```

The database is comprised of two SQL tables, a Hackers table and a Skills  table. The Hackers table stores hackers records where ```hacker_id``` is the primary key (```name```, ```company```, ```email```, ```phone``` were not chosen as primary keys because those fields are subject to change). The Skills table stores skills records where ```skill_id``` is the primary key and ```hacker_id``` is a foreign key. The two tables are linked by a one-to-many relationship where one record of the Hackers table points to multiple records in the Skills table.

Step 3: Start the app by running in your terminal:

```
npm run start
```

The app will be listening at ```http://localhost:3000```

## API

### All users endpoint

A ```GET``` request to ```http://localhost:3000/hackers/``` will return all hacker data from the database in JSON format.

<img src="/assets/endpoint1.PNG" />

An SQL join was needed for this endpoint because hackers records and skills records are stored in 2 separate tables.

### User Information Endpoint

A ```GET``` request to ```http://localhost:3000/hackers/123``` will return the full hacker data for the hacker with the primary key ```123```. This works for all hackers with valid primary keys.

<img src="/assets/endpoint2.PNG" />

A request with an invalid primary key will not display any hacker data, instead its response will be "No hacker found with that id."

<img src="/assets/endpoint2_again.PNG" />

### Updating User Data Endpoint

A ```PUT``` request to ```http://localhost:3000/hackers/123``` with body data will partially update the hacker with the primary key ```123``` with the info specified in the request. Then, the endpoint will return the full updated hacker's data.

<img src="/assets/endpoint3.PNG" />

The endpoint ignores irrelevant request body data for fields other than ```name```, ```company```, ```email```, ```phone```, ```skills```.

<img src="/assets/endpoint3_again.PNG" />

Additionally, the endpoint ignores invalid skills that do not contain ratings. The endpoint only performs updates with items in the requested  ```skills``` array if the skill has a ```skill``` property and ```rating``` integer property.

<img src="/assets/endpoint3_final.PNG" />

### Skills Endpoints

A ```GET``` request to ```http://localhost:3000/skills?min_frequency=5&max_frequency=10``` will query the skills that are possessed by 5-10 different hackers. These ```min_frequency``` and ```max_frequency``` can be changed accordingly.

<img src="/assets/endpoint4.PNG" />

A request with an invalid frequencies will not display any skills data, instead its response will be "Please enter valid frequencies."

<img src="/assets/endpoint4_again.PNG" />

### BONUS ENDPOINT: Hacker Contact Info

Personally, as a hacker during hackathon events, I find myself meeting lots of new people, but always lose contact with them after the hackathon ends because I forget to ask for their contact information. This endpoint provides hackers with useful information in case they want to reconnect with people they meet at a hackathon.

A ```GET``` request to ```http://localhost:3000/contact?name=Elizabeth Scott``` will query the contact info of the hacker named Elizabeth Scott. This works for all requests with valid hacker names.

<img src="/assets/endpoint5.PNG" />

A request with an unknown hacker name will not display any contact info, instead its response will be "No hacker found with that name."

<img src="/assets/endpoint5_again.PNG" />
