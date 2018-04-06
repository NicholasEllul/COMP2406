Student Readme Section 

COMP 2406 Assignment 4
Nicholas Ellul - Student Number: 101064168
Peter Khlopenkov - Student Number: 101072312

Systems tested on:
     MacOS v10.13.2 with Node v8.9.1
     MacOS v10.12.6 with Node v8.9.1
     Lubuntu v16.03 with Node 6.11.2

Install: 
	Run the command...
		npm install

Launch: 
	Start the mongodb server by running...
		sudo mongod
		
	TROUBLESHOOTING: ----------
		* On my virtual machine, mongod wasn't working at first. To make it work I had to run the commands 
			sudo chown `whoami` /tmp/mongodb-27017.sock
		* then
			sudo mkdir -p /data/db
	---------------------------
	
	Then from the root, populate the database by running...
		node seed/populate-for-startup.js
		
	Then start the server by running...
		npm start
		
Testing: 
	visit http://localhost:3000/ to load the website
	Log in using any of the users specified in the seed file.
	One example user is...
		username: admin@admin.com 
		password: admin



BELOW IS THE README CREATED BY THE ORIGINAL DEVELOPER

To run this app you need a personal Paypal Account
You can create on at paypal.com
When you create the account you don't need to link a credit card or bank account at that
time. I just ignored that step when prompted and it created the account anyway. I received confirmation by email.

1) Changing paypal account
Visit app.js file then change client_id and client_secret with your 
paypal sandbox account. 

You can create a sandbox account from below link
https://developer.paypal.com/

3) Setup project
Before starting application please run the populate-for-startup.js 
file inside the seed directory to populate the mongodb database.
You can basically run the file with below command (after locating in the terminal)
node populate-for-startup.js

Install the npm module depedencies in package.json by exectuing:
npm install

4) Run the application
In the application folder execute:
npm start 
then you can access from localhost at
http://localhost:3000

5) Login to the app using the dummy user for project:
username : admin@admin.com
password : admin

5) Important
Before starting application please make sure your mongo database runs.

6) Features
Add product
Delete product
Update product
Buy item
Shopping cart
Order history
Multiple search with comma => itemName,ItemName2
Filters