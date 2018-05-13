Nicholas Ellul - 101064168

Version:
    Tested on MacOS 10.13.2 using...
        - Chrome 65.0.3325.146
        - Node 9.5.0
        - Npm 5.6.0
        - EJS 2.5.7
        - Express 4.16.3
        - Request 2.85.0

    Tested on Lubuntu 16.03 using...
        - Chromium web browser
        - node 6.12.3
        - Npm 3.10.10
        - EJS 2.5.7
        - Express 4.16.3
        - Request 2.85.0

Install: 
    install express, ejs, and request by running the command
        npm install

Launch:
    node app.js

Testing: 
    visit one of the below webpages...
        http://localhost:3000/recipes.html
        http://localhost:3000/recipes
        http://localhost:3000/index.html
        http://localhost:3000/
        http://localhost:3000

    Once there type in a list of ingredients separated by commas into the form and click submit to see related recipies
    Optionally, you can manually add the query to the end of your URL 
    Ex:
        http://localhost:3000/recipes?ingredients=apples,chocolate
    Note: you can add the ?ingredients=apples,chocolate onto the end of any of the above URL's specified