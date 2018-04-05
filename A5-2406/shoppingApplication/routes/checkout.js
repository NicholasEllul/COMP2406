var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Order = require('../models/order');
const paypal = require('paypal-rest-sdk');

let newItem
//Paypal configuration
paypal.configure({
	'mode': 'sandbox', //sandbox or live
	'client_id': 'Acj2PWk5WbziUhhT5pg8A8jMPJVW1SNcw1EdNwlfZw8dZHJw-pJm9NAd8RlacpRMsWUBLrZLroxxigQ2',
	'client_secret': 'EEVbMoMbOHjbGwCY8_F3523LuIN4mSO8IYSFMhnebmqzi5o8J57RDaJf_ttFlIvv7uTiBC4mSRfamMsx'
});

let create_payment_json = {
	"intent": "sale",
	"payer": {
		"payment_method": "paypal"
	},
	"redirect_urls": {
		"return_url": "http://localhost:3000/checkout/checkout-success",
		"cancel_url": "http://localhost:3000/checkout/checkout-cancel"
	},
	"transactions": [{
		"item_list": {
			"items": [{
				"name": "item",
				"sku": "item",
				"price": "1.00",
				"currency": "CAD",
				"quantity": 1
			}]
		},
		"amount": {
			"currency": "CAD",
			"total": "1.00"
		},
		"description": "This is your purchase from HeadSail."
	}]
};

// GET checkout page
router.get('/', ensureAuthenticated, function (req, res, next) {
	console.log(`ROUTE: GET CHECKOUT PAGE`);
	var cart = new Cart(req.session.cart);
	var totalPrice = cart.totalPrice;
	res.render('checkout', {
		title: 'Checkout Page',
		items: cart.generateArray(),
		totalPrice: cart.totalPrice,
		bodyClass: 'registration',
		containerWrapper: 'container',
		userFirstName: req.user.fullname
	});
});

// POST checkout-process
router.post('/checkout-process', function (req, res) {
	console.log(`ROUTE: POST CHECKOUT-PROGRESS`);
	var cart = new Cart(req.session.cart);
	let items = cart.generateArray();
	var totalPrice = cart.totalPrice;

	create_payment_json.transactions[0].item_list.items = []; //clear items in json

	for(let item of items){ //set item info in create_payment_json
		newItem = {};
		newItem.name = item.item.title;
		newItem.quantity = item.qty;
		newItem.price = item.item.price;
		newItem.sku = "item";
		newItem.currency = "CAD";
		create_payment_json.transactions[0].item_list.items.push(newItem);
	}

	create_payment_json.transactions[0].amount.total = totalPrice; //set transaction total

	console.log(create_payment_json);
	console.log(create_payment_json.transactions[0].amount.total);
	console.log(create_payment_json.transactions[0].item_list.items);
	console.log("\n\n\n\n\n\n dilly dilly")
	console.log( req.session)

	paypal.payment.create(create_payment_json, function (error, payment) { //create paypal payment

		if (error) {
			console.log(error);
			console.log("\n\n\n\n\n\n")
				console.log(payment);
			console.log(error.response.details);
			throw error;
		} else {
			console.log("Create Payment Response");
			for(let link of payment.links){
				if(link.rel === 'approval_url'){
					console.log(payment)

					res.redirect(link.href); //link to payment approve page
				}
			}
		}
	});
});

// GET checkout-success
router.get('/checkout-success', ensureAuthenticated, function (req, res) {
	console.log(`ROUTE: GET CHECKOUT-SUCCESS`);

	var paymentId = req.query.paymentId;
	var payerId = { payer_id: req.query.PayerID };

	paypal.payment.execute(paymentId, payerId, function(error, payment){
		if(error){
			console.error(JSON.stringify(error));
		}
		else {
		//	console.log(payment.payer.payer_info.shipping_address)
			req.session.cart = new Cart({});
			var totalPrice = 0;
			console.log(req.session)
			addressObj = payment.payer.payer_info.shipping_address
			addressString = `${addressObj.line1}, ${addressObj.city} ${addressObj.state} ${addressObj.country_code} ${addressObj.postal_code}`

			let newOrder = new Order({
				orderID             : payment.cart,
				username            : req.user.username,
				address             : addressString,
				orderDate           : payment.create_time,
				shipping            : true
			});
		   newOrder.save();

			res.render('checkoutSuccess', {title: 'Successful', containerWrapper: 'container', userFirstName: req.user.fullname, email: req.user.username})
		}
	});
});

// PAYMENT CANCEL
router.get('/checkout-cancel', ensureAuthenticated, function (req, res) {
	console.log(`ROUTE: GET CHECKOUT-CANCEL`);
	res.render('checkoutCancel', {title: 'Successful', containerWrapper: 'container', userFirstName: req.user.fullname});
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	else {
		console.log(`ERROR: USER IS NOT AUTHENTICATED`);
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/');
	}
}

module.exports = router;
