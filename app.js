// this file runs the REST API and controls interactions with the JSON database.

// requiring dependencies, constants
const express = require("express"), // use express in order to host the server on localhost:8000
	  bodyParser = require("body-parser"), // use body parser in order to process JSON request to the server.
      fs = require("fs"), // use fs (file system) in order to read and write local files such as data.json
      _ = require("underscore");// use underscore to speed up searching through object literals and arrays

var data = require("./data.json"); // use data.json file which acts as the database - stores contents of data.json within data variable.

let app = express(); // create the app by calling express. See express docs for more.
app.use(bodyParser.json()); // use body parser json helper as middleware 

// Note: api route is http://localhost:8000, so if route is GET /api/login, the full request is just GET http://localhost:8000/api/login
app.post("/api/register", (req, res) => { // create a route, POST /api/register, used for registering new users.
	console.log(req.body);
	data[req.body.uid] = { // create a new user entry with key user id and value of an object with user data. (See Schema) - store this in the variable data.
		"firstName": req.body.first.trim(),
		"lastName": req.body.last.trim(),
		"lists": {
			"work": [
			],
			"home": [
			],
			"errands": [
			]
		}
	}
	console.log(data);
	fs.writeFile("./data.json", JSON.stringify(data, null, 4), (e) => { // Write the changes made to the data variable. Args of json stringify are for prettifying
		if (e) throw e; // if the file change failed, throw an error.
		console.log("Registered " + req.body.uid); // 
	});

	res.json({ // send success response - send user credentials.
		success: true,  // send successful response
		firstName: req.body.first.trim(), // sends first name of user
		lastName: req.body.last.trim(), // sends last name of user
		uid: req.body.uid, // send user unique id
		lists: data[req.body.uid]["lists"] // sends the (currently empty) list object to the server.
	});
	// (please note, error handling is taken care by Firebase. If user attempts to sign up with email that is already registered, firebase won't allow user to create an account)
});

app.delete("/api/todo", (req, res) => { // create a route, DELETE /api/todo, for tasks
	data[req.body.uid]["lists"][req.body.cat] = _.reject(data[req.body.uid]["lists"][req.body.cat], (todo) => { // remove the task from the stored variable (using underscore).
		return todo["id"] == req.body.todoId;
	});
	console.log(req.body);
	console.log(data[req.body.uid]["lists"][req.body.cat]);

	fs.writeFile("./data.json", JSON.stringify(data, null, 4), (e) => { // write changes to the JSON file
		if (e) throw e; // if it fails, throw the error.
	});
	return res.json({
		success: true, // return successful response.
	})
});

app.get("/api/:uid/login", (req, res) => { // create a route, GET /api/:uid/login, where uid is the logged in users generated id, used for sending back the lists to the client. 
	let firstName = data[req.params.uid]["firstName"];
	let lastName = data[req.params.uid]["lastName"];

	res.json({ // return the sucessful response.
		success: true,
		firstName: firstName,
		lastName: lastName,
		lists: data[req.params.uid]["lists"],
		uid: req.params.uid
	});
});

app.post("/api/todo/", (req, res) => { // create a route, POST /api/todo for creating a new task.
	console.log(req.body);
	console.log(data[req.body.uid]["lists"][req.body.category]);

	data[req.body.uid]["lists"][req.body.category].push({ // create the new task in the data variable.
		"id": req.body.todoId,
		"title": req.body.title,
		"description": req.body.desc,
		"date": req.body.date,
		"priority": req.body.priority	
	});
	fs.writeFile("./data.json", JSON.stringify(data, null, 4), (e) => { // push changes to data.json
		if (e) throw e;
		console.log("Added todo " + req.body.uid);
	});
	res.json({ // send successful response containing data regarding the task.
		success: true,
		title: req.body.title,
		description: req.body.desc,
		priority: req.body.priority
	})
});

app.get("/api/:uid/todo/", (req, res) => { // create a route, /api/:uid/todo, used to retrieve the lists belonging to a user.
	return res.json(data[req.params.uid]["lists"]); // use the user id to get the lists belonging to the user from the server.
});



app.listen(process.env.PORT || 3000); // listen on port 3000, api made live.