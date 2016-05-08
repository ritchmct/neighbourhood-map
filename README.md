# Neighbourhood Map project
## The Challenge
You will develop a single-page application featuring a map of your neighborhood or a neighborhood you would like to visit. You will then add additional functionality to this application, including: map markers to identify popular locations or places you’d like to visit, a search function to easily discover these locations, and a listview to support simple browsing of all locations. You will then research and implement third-party APIs that provide additional information about each of these locations (such as StreetView images, Wikipedia articles, Yelp reviews, etc).
## The Implementation
This project has been completed using the [Knockout.js](http://knockoutjs.com/) library and a number of third-party APIs. The **index.html** includes data bindings that interact with the Knockout.js ViewModel defined in **viewModel.js**. The following is a list of the scripts written and the libraries and APIs used in completing this project:
### Scripts
**model.js** - Contains the initial data about the places in addition to the AJAX calls to the Yelp and Foursquare APIs to retrieve additional data.
<br>
**viewModel.js** - Defines the Knockout.js ViewModel for dealing with the drop down list of places and filtering the list based on user input.
<br>
**viewMap.js** - Initialises the Map display and handles the interaction with map Markers and InfoWindow displays.
<br>
### Libraries
[Knockout.js](http://knockoutjs.com/) - Used in the implementation of the list of places<br>
[jQuery](http://jquery.com/) - Used for AJAX calls in model.js and for ease of DOM manipulation in viewMap.js<br>
[oauth/sha1](https://oauth.googlecode.com/svn/code/javascript/) - JavaScript software for implementing an OAuth consumer. Author: John Kristian. Used to authorize AJAX calls to Yelp
### APIs
[Google Maps API](https://developers.google.com/maps/)<br>
[Yelp API](https://www.yelp.com/developers/documentation/v2/overview)<br>
[Foursquare API](https://developer.foursquare.com/)
## Build
A **gulp** workflow is used to create the **dist** tree from the original **src**<br>
**gulp-htmlmin**, **gulp-cssnano**, **gulp-uglify** and **gulp-useref** are used to minify all html, css and javascript.<br>
**gulp-jshint** is used to check JavaScript syntax.<br>
`gulp build` command will clear the **dist** directory, check JavaScript syntax, and then recreate the **dist** directory.


The active **dist** site can be viewed [here](http://ritchmct.github.io/neighbourhood-map/dist/index.html)
## Installation
This is a single-page web application. Copying the contents of the dist directory (maintaining the directory structure) to a web server will complete installation.
## License
This project is licensed under the terms of the MIT license

