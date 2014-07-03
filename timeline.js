/**
 * Timeline of when your friends joined Twitter
 * Jon Bulava
 * @jbulava
 */

// Initialize the app
var express = require('express');
var app     = express();

// Load ejs views for rendering HTML
app.engine('ejs', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Initialize the Twitter client
var Twitter = require('twit');
var config  = require('./config');
var twitter = new Twitter(config);

// Get the user IDs of 100 friends
function getFriends(next) {
	twitter.get('friends/ids', { screen_name: config.screen_name, count: 100 }, function(err, data) {

		// If we have the IDs, we can look up user information
		if (!err && data) {
			lookupUsers(data.ids, next);
		}

		// Otherwise, return with error
		else {
			next(err);
		}
	});
}

// Get user information for the array of user IDs provided
function lookupUsers(user_ids, next) {
	twitter.get('users/lookup', { user_id: user_ids.join() }, function(err, data) {

		// If we have user information, we can pass it along to render
		if (!err && data) {

			// We'll fill this array with the friend data you need
			var friends_array = new Array();

			for (index in data) {

				// Get your friend's join date and do some leading zero magic
				var date = new Date(data[index].created_at);
				var date_str = date.getFullYear() + '-'
							 + ('0' + (date.getMonth()+1)).slice(-2) + '-'
							 + ('0' + date.getDate()).slice(-2);

				// Push the info to an array
				friends_array.push({
					'name'          : data[index].name,
					'screen_name'   : data[index].screen_name,
					'created_at'    : date_str,
					'profile_image' : data[index].profile_image_url,
					'link_color'	: data[index].profile_link_color
				});
			}

			// The callback function defined in the getFriends call
			next(err, friends_array);
		}

		// Otherwise, return with error
		else {
			next(err);
		}
	});
}

// This is the route for our index page
app.get('/', function(req, res){

	// Calling the function defined above to get friend information
	getFriends(function(err, data) {

		// Render the page with our Twitter data
		if (!err && data) {
			res.render('index', { friends: data });
		}

		// Otherwise, render an error page
		else {
			res.send('Something went wrong :(\n'+err.message);
		}
	});
});

// Start the server
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});