eclo watch
===========================

eclo watch is sample web application that aims to show how to use Sierra Wireless [AirVantage Enterprise Platform](https://na.airvantage.net/) to create an added value service on top of it. This sample application make use of some of the REST API provided by AirVantage to build a custom UI that fits a specific domain. In this case the domain is greenhouse remote monitoring and especially [eclo dev kits](http://airvantage.github.io/devkit/) greenhouse.

Scenario
----------------------------

A company, eclo inc, that sells greenhouse monitoring equipements, wants to provide its customers with an online service to monitor their greenhouses remotely. In order to reduce development time, eclo inc has decided to use AirVantage Enterprise Platform as a backend for their own service. 

AirVantage will provide the services to manage communicating devices, embedded applications, alert generation rules, data sent by the greenhouses and users from customer companies. As the AirVanatage UI is dedicated to manage M2M issues and not greenhouse monitoring ones, eclo inc will provide these users with a dedicated UI, hosted on their own servers and relying in the background on AirVanatage API in order to perform the heavy lifting. 


Features
---------------------------

You can find a live demo of this dedicated service hosted on Amazon Elastic Beanstalk at the folowing URL: [http://eclowatch.elasticbeanstalk.com/](http://eclowatch.elasticbeanstalk.com/).
You have to sign in with the folowing user (representing a customer of eclo inc company):
* username: userA1@customerA.com
* password: eclo-pass1

### User login

This part shows how to use AirVantage user management and authentication system in your application. It relies on https://na.airvantage/api/auth API and the [OAuth2](http://oauth.net/) protocol. In this example user accounts management is completly delegated and the web app just hand over user credentials to AirVanatage. It gets back an access token that repersents the user session and shall be used to perform requests to AirVantage API in the name of the user (i.e. with the same right and visibility, the user would have if she were logged in AirVantage UI). 


### Business oriented presentation of the systems

This part of the application aims to show systems (connected greenhouses) in a domain specific view. Indeed it mixes:
* device management information (last communication date) from the system API
* business data sent by the system (last values of the sensors) from the data part of the system API
* information about the ongoing alerts (unacknolwedged alerts) from the alert API

The system details view also adds a graph built thanks to the historical data API, enabling to monitor the evolution of the sensor values.

### Geographical presentation of the systems

This view shows how to use location information provided by the system API in a customized map built on top of the Google Maps API.

### Focus on alerts

Throughout the application the user have information about the ongoing alerts about the greenhouses: 
* in the nav bar their is a badge showing unaknowledge alerts
* several view display alert filster according differnet criteria (system, acknowledge status, ...)
* both the alerts view and system view show how to acknowledge alerts.


Code
---------------------------

For the sake of simplicity all pages are generated on the server side and no ajax request are performed on the client side.

### Used projects:

Server side:
* Server: [Node](http://nodejs.org/)
* Package management [NPM](https://npmjs.org/)
* Framework: [Express](http://expressjs.com/)
* Templating: [ejs](http://embeddedjs.com/)
* REST request: [Async](https://github.com/caolan/async)
* Utilities: [Underscore](http://underscorejs.org/)

Client side:
* Package management: [Bower](http://bower.io/)
* Map: [Google Maps](https://developers.google.com/maps/documentation/javascript/)
* Data visualization: [D3](http://d3js.org/) and [Rickshaw](http://code.shutterstock.com/rickshaw/)
* Styling: [Bootstrap](http://getbootstrap.com/), [Font Awesom](http://fontawesome.io/), [The Noun Project](http://thenounproject.com/)
* Utilities: [Underscore](http://underscorejs.org/)

### Architecture

#### Routes

The app.js file shows how the rounting of incomming requests is done thanks to the Express library and how middlewears are used to perform generic tasks (logging, body parsing, ...). These routes serves either static resources or application page. In this case they call the dedicated controller after going through the aut.check midlewear which verifies that the user is actually logged in.

#### Model

The model directory contain the airvantage.js file that manage the creation of REST requests to AirVanatage. 
Two constructor functions are used to abstract away the management of the http queries (error management, parsing of the response, ...). The various requests needed in the application are then built thanks to these functions. These requests are themselves functions that will be called in the controller with the parameters of the actual request. They are designed to work well with the asyncjs libraries that helps to manage aggregation of REST requests.

#### Controller

The controller directory contains a js file per controller. Each controller handle specific requests by sending query to AirVantage and agrgating the responses in order to render the view.

#### Views

The views directory contains all the ejs template file that will be used by controller to render the views.


Setup
---------------------------

### Prerequisites
1. Have an [AirVantage Enterprise Platform](https://na.airvantage.net/) account
 * You can use the [sign up](https://signup.airvantage.net/public/avep/) to create an evaluation account
2. Have at least one live [eclo system](http://airvantage.github.io/devkit/) associated to your AirVantage account

### Install it

1. Install Node.js.
2. Install Bower: `$ sudo npm install -g bower`.
 * `-g` means globally, so it will be available system wide.
3. Install server application dependencies:`$ npm install`.
 * npm will use package.json to fetch dependencies.
 * Without `-g`, packages will be available only from this projects.
4. Install client dependencies using bower: `$ bower install`.
 * bower will use component.json to fectch dependencies.
 * They will also be available only for this project.
5. In AirVantage create an API client (`Develop > API clients > Create`)
 * Name: `eclo watch dev`
 * Redirect URL: `http://localhost:3000`
6. Copy past the client id and secret key of this client API in the `controllers/auth.js` file
 * In global vars `client_id` and `client_secret`

### Run it

Run server on the port 3000 : `$ node app.js 3000`

### Test it
Open http://localhost:3000 and sign in with your AirVanatage account
