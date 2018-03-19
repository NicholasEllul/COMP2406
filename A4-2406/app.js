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
	//You need to provide an appid with your request.
	//Many API services now require that clients register for an app id.

	apiRequest(`http://www.food2fork.com/api/search?q=${ingredient}&key=${API_KEY}`, {json:true}, function (error, response, body){
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
app.use(express.urlencoded());

let handler = function(request,response){

	let ingredientList = null;

	if(request.method == "GET"){
		ingredientList = request.query.ingredients;
	}

	if(request.method == "POST"){
		if(request.body.ingredients)
			ingredientList = request.body.ingredients;
	}
	
	renderRecipes(ingredientList,response);
};

app.all(ROUTE_REGEX, handler);

app.listen(PORT, err => {
	if(err) console.log(err)
	else {console.log(`Server listening on port: ${PORT}`)}
});