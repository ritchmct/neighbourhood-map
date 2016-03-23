var neighbourMap = neighbourMap || {};

(function(o) {
  'use strict';
  o.model = o.model || {};

  o.model.yelpRequest = function(terms, location, successCb, errorCb) {

    var parameters = {
      'term': terms,
      'location': location,
      'callback': 'cb',
      'cc': o.model.countryCode,
      'oauth_consumer_key': yelpKeys.consumerKey,
      'oauth_consumer_secret': yelpKeys.consumerSecret,
      'oauth_token': yelpKeys.token,
      'oauth_signature_method': 'HMAC-SHA1'
    };

    var message = {
      'action': 'http://api.yelp.com/v2/search',
      'method': 'GET',
      'parameters': parameters
    };

    console.log(message);

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, {
      consumerSecret: yelpKeys.consumerSecret,
      tokenSecret: yelpKeys.tokenSecret
    });

    var parameterMap = OAuth.getParameterMap(message.parameters);
    var yelpRequestTimeOut = setTimeout(errorCb, 4000);

    $.ajax({
      'url': message.action,
      'data': parameterMap,
      'dataType': 'jsonp',
      // Cache true is required or this request will fail
      'cache': true
    }).done(function(data) {
      successCb(data);
      clearTimeout(yelpRequestTimeOut);
    }).fail(function() {
      errorCb();
    });
  }

  // API keys
  var yelpKeys = {
    consumerKey: 'KcloByrNIq62_T5pIUn6wQ',
    consumerSecret: 'uQpSiWPmBgSNue7hP8cMUm_mWis',
    token: 'NbGbu5Vd99gHAZ_ZjGHI366M9bWUuHMH',
    tokenSecret: 'fvH1r43u-IhRdZ_u01W5nSQZlP8'
  };

  var foursquareKeys = {};

  o.model.googleMapsKey = 'AIzaSyBvTqqqQmN6DRkaYvp23R-_YZCSgzG6Itg';


  // Set up initial places

  o.model.city = 'Edinburgh';
  o.model.countryCode = 'FR';
  o.model.centerLocation = { lat: +55.95, lng: -3.21 };

  o.model.initialPlaces = [{
    name: 'Dean Gallery',
    location: { lat: +55.94, lng: -3.22 }
  }, {
    name: 'Edinburgh Castle',
    location: { lat: +55.95, lng: -3.19 }
  }];

})(neighbourMap);