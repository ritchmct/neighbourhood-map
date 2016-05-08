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

    // console.log(message);

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, {
      consumerSecret: yelpKeys.consumerSecret,
      tokenSecret: yelpKeys.tokenSecret
    });

    var parameterMap = OAuth.getParameterMap(message.parameters);
    var yelpRequestTimeOut = setTimeout(function() { errorCb('Yelp'); }, 4000);

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
      errorCb('Yelp');
      clearTimeout(yelpRequestTimeOut);
    });
  };

  o.model.foursquareRequest = function(name, location, successCb, errorCb) {

    var foursquareRequestTimeOut = setTimeout(function() { errorCb('Foursquare'); }, 4000);
    var url = 'https://api.foursquare.com/v2/venues/search';
    var loc = location.lat + ',' + location.lng;

    $.getJSON(url, {
      client_id: foursquareKeys.client_id,
      client_secret: foursquareKeys.client_secret,
      v: '20160301',
      m: 'foursquare',
      ll: loc,
      limit: 1,
      query: name
    }).done(function(data) {
      // Retrieve id from search request to use in specific request for venue
      // The venue request will return the full object rather than just the compact object
      var id = data.response.venues[0].id;
      var url = 'https://api.foursquare.com/v2/venues/' + id;
      $.getJSON(url, {
        client_id: foursquareKeys.client_id,
        client_secret: foursquareKeys.client_secret,
        v: '20160301',
        m: 'foursquare'
      }).done(function(data) {
        successCb(data);
        clearTimeout(foursquareRequestTimeOut);
      }).fail(function() {
        errorCb('Foursquare');
        clearTimeout(foursquareRequestTimeOut);
      });
    }).fail(function() {
      errorCb('Foursquare');
      clearTimeout(foursquareRequestTimeOut);
    });
  };

  // API keys
  var yelpKeys = {
    consumerKey: 'KcloByrNIq62_T5pIUn6wQ',
    consumerSecret: 'uQpSiWPmBgSNue7hP8cMUm_mWis',
    token: 'NbGbu5Vd99gHAZ_ZjGHI366M9bWUuHMH',
    tokenSecret: 'fvH1r43u-IhRdZ_u01W5nSQZlP8'
  };

  var foursquareKeys = {
    client_id: 'XNFGKUAHSLQ2TNKIOFTURDIAYKR4M5S4ITGZCPFHMSYHEIRY',
    client_secret: 'RYRV0TTFV0PMLGHRASNB3W1MCQA1WZVQIG3XXDL2ZM1PIJCO'
  };

  o.model.googleMapsKey = 'AIzaSyBvTqqqQmN6DRkaYvp23R-_YZCSgzG6Itg';


  // Set up initial places

  o.model.city = 'Edinburgh';
  o.model.countryCode = 'GB';
  o.model.centerLocation = { lat: +55.95, lng: -3.21 };

  o.model.initialPlaces = [{
    name: 'Dean Gallery',
    location: { lat: +55.95187295, lng: -3.22418422 }
  }, {
    name: 'Edinburgh Castle',
    location: { lat: +55.9485947, lng: -3.1999135 }
  }, {
    name: 'Arthur Seat',
    location: { lat: +55.9440833, lng: -3.1618333 }
  }, {
    name: 'Gallery of Modern Art',
    location: { lat: +55.9509239, lng: -3.22784275 }
  }, {
    name: 'Scott Monument',
    location: { lat: +55.952381, lng: -3.1932741 }
  }, {
    name: 'Hibs Football Club',
    location: { lat: +55.961834, lng: -3.165275 }
  }, {
    name: 'Murrayfield Stadium',
    location: { lat: +55.942512, lng: -3.241160 }
  }, {
    name: 'Hearts Football Club',
    location: { lat: +55.939075, lng: -3.232234 }
  }, {
    name: 'National Museum of Scotland',
    location: { lat: +55.946831, lng: -3.190632 }
  }, {
    name: 'Holyrood Palace',
    location: { lat: +55.952581, lng: -3.171766 }
  }, {
    name: 'Waverley Station',
    location: { lat: +55.951788, lng: -3.190477 }
  }, {
    name: 'Dynamic Earth',
    location: { lat: +55.9505575, lng: -3.1744426 }
  }];

})(neighbourMap);
