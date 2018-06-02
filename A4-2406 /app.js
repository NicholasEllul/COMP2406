const express = require('express');
const app = express();
const apiRequest = require('request');
let qstring = require('querystring')

const PORT = process.env.PORT || 3000
const ROOT_DIR = '/public'; 
const VIEW_DIR = '/views';
const API_KEY = '8dadac7216b82e93d694764054d7ef3e';
const ROUTE_REGEX = '/|/recipes(\.html)?|/index(\.html)?'

function renderRecipes(ingredient,res){
	// This function makes the API request and renders the view in the callback function

	apiRequest(`http://www.food2fork.com/api/search?q=${ingredient}&key=${API_KEY}`, {json:true}, function (error, response, body){
		// IF there were no errors render
		if (!error && response.statusCode == 200) {
			res.render('pages/index',body);
		}
		else if (error) console.log(error);
	});
}


// Two lines below from EXPRESS.JS Crash Course on youtube
// https://www.youtube.com/watch?v=gnsO8-xJ8rs
app.set('view engine', 'ejs');
app.set('views',__dirname + VIEW_DIR);

app.use(express.static(__dirname + ROOT_DIR)); 

// Below two lines were discovered at 
// https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));

let handler = function(request,response){
	
	// Default ingredients list to nothing incase no valid data is given
	let ingredientList = null;

	if(request.method == "GET"){ // Get the URL queries ingredients if a get request is made
		ingredientList = request.query.ingredients;
	}

	if(request.method == "POST"){ // Get the post body ingredients if a post is made
		if(request.body.ingredients)
			ingredientList = request.body.ingredients;
	}
	
	// Call the render with those ingredients
	renderRecipes(ingredientList,response);
};

// Handle all get/post/etc.. requests that match my regex for valid URLs
app.all(ROUTE_REGEX, handler);

app.listen(PORT, err => {
	if(err) console.log(err)
	else {console.log(`Visit localhost:${PORT}/recipes`)}
});