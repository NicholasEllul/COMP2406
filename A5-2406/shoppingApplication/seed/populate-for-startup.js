var Product     = require('../models/product');
var User        = require('../models/user');
var mongoose    = require('mongoose');

var users = [
	new User({
		username    : 'admin@admin.com',
		password    : 'admin',
		fullname    : 'Peter Khlopenkov',
		admin       : true
	}),
	new User({
		username    : 'admin2@admin.com',
		password    : 'admin',
		fullname    : 'Nicholas Ellul',
		admin       : true
	})
];

var products = [
	new Product({
		imagePath   : 'https://images.the-house.com/aerotech-airx-windsurf-sail-blu-15-prod.jpg',
		title       : 'Super Fast Sail',
		description : 'This sail goes super fast.',
		price       : 69.99
	}),
	new Product({
		imagePath   : 'http://pritchardwindsurfing.com/wp-content/uploads/2014/11/2014-Lion-05.jpg',
		title       : 'Cool sail',
		description : 'This is a cool sail to say the least.',
		price       : 99.99
	}),
	new Product({
		imagePath   : 'http://pritchardwindsurfing.com/wp-content/uploads/2016/01/IMG_3186-640x853.jpg',
		title       : 'Another sail',
		description : 'A sail for someone who just wants one more sail.',
		price       : 34.99
	}),
	new Product({
		imagePath   : 'http://www.ionclubgolfderoses.com/typo3temp/pics/d357e8d131.jpg',
		title       : 'Semi-Transparent sail',
		description : 'A sail that is partially transparent.',
		price       : 29.99
	}),
	new Product({
		imagePath   : 'http://www.anemoswindsurf.gr/images/uploads/2012NaishIndy.jpg',
		title       : 'Two Sails',
		description : 'Two sails for the price of two',
		price       : 79.99
	}),
	new Product({
		imagePath   : 'https://images.the-house.com/aerotech-freespeed-windsurf-sail-red-17-prod.jpg',
		title       : 'Blue and red sail',
		description : 'This sail is blue and red',
		price       : 1.99
	}),
	new Product({
		imagePath   : 'https://4boards.co.uk/wp-content/uploads/2016/10/GA-Sails-IQ-2017-Gaastra-C2.jpg',
		title       : 'Yellow And Pink sail',
		description : 'This is sail is yellow and pink',
		price       : 7.99
	}),
	new Product({
		imagePath   : 'https://i.pinimg.com/736x/0b/50/32/0b50323faf2bfca01edc03206d7a776a--captain-jack-sparrow-black-pearls.jpg',
		title       : 'Jack Sparrow',
		description : 'Jack Sparrow for "sail"',
		price       : 34.99
	}),
	new Product({
		imagePath   : 'http://keyassets.timeincuk.net/inspirewp/live/wp-content/uploads/sites/21/2016/06/Sail-fast-9-Spinnaker-MAIN-624x400.png',
		title       : 'Spinnaker',
		description : 'A spinnaker sail.',
		price       : 29.99
	}),
	new Product({
		imagePath   : 'https://i.pinimg.com/474x/fa/57/9a/fa579a9c9e740d5f0228d3f514f7dc4c.jpg',
		title       : 'East asian sail',
		description : 'A sail originating from east asia',
		price       : 79.99
	})
];

mongoose.connect('mongodb://localhost/shoppingApp', function(err, db){
	if (err) throw err;
	console.log('Successfully connected to mongodb');

	clearDatabase();
});

function clearDatabase(){
	let modelCounter = 0;
	let numModels = mongoose.modelNames().length
	if(mogoose.modelsNames().length > 0){
		for(let model of mongoose.modelNames()){
			console.log(model);
			mongoose.model(model).remove({},function(err){
				if(err) {
					console.log('ERROR: Remove ' + model + ' failed.');
					return;
				}

				console.log('Remove ' + model + ' succeeded.');
				if(modelCounter === numModels-1){
					seedDatabase();
				}
				modelCounter++;
			});
		}
	}else{
		seedDatabase();
	}
}

let usersCreated = false;
let productsCreated = false;

function seedDatabase(){
	console.log("Seeding database");
	createUsers();
	createProducts();
}

function createUsers(){
	for(let i = 0; i < users.length; i++){
		User.createUser(users[i], function(err, user){
			if(err) throw err;
			console.log("Created:");
			console.log(user);

			if(i === users.length-1){
				usersCreated = true;
			}

			if(usersCreated && productsCreated){
				exit();
			}
		});
	}
}

function createProducts(){
	for (let i = 0; i < products.length; i++){
		products[i].save(function(err, product) {
			if(err) throw err;

			console.log("Created:");
			console.log(product);

			if (i === products.length - 1){
				productsCreated = true;
			}

			0if(usersCreated && productsCreated){
				exit();
			}
		});
	}
}

function exit() {
	mongoose.disconnect();
}
