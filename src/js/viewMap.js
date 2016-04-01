var neighbourMap = neighbourMap || {};

(function(o) {
  'use strict';
  o.viewMap = o.viewMap || {};

  // Make these variables accessible from outside of initMap
  var map, infoWindow, marker;

  // Create initial map
  o.viewMap.initMap = function() {

    map = new google.maps.Map(document.getElementById('map'), {
      center: neighbourMap.model.centerLocation,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        mapTypeIds: [
          google.maps.MapTypeId.ROADMAP,
          // google.maps.MapTypeId.TERRAIN,
          google.maps.MapTypeId.SATELLITE
        ]
      }
    });

    // Just create a single infoWindow that will be shared by all markers
    infoWindow = new google.maps.InfoWindow({
      content: 'No data to display'
    });

    // Make infoWindow globally available to neighbourMap
    o.viewMap.infoWindow = infoWindow;

    // Create a marker for each place in the placeList
    neighbourMap.viewModel.ViewModel.placeList().forEach(function(place) {
      place.marker = new google.maps.Marker({
        position: place.location,
        map: map,
        animation: google.maps.Animation.DROP,
        title: place.name()
      });

      // When marker is clicked run a function to retrieve data
      console.log(place.marker);
      place.marker.addListener('click', function() {
        console.log("marker clicked");
        o.viewMap.getData(place, 'foursquare');
      });

    });
  };

  // Bounce the marker for a short period
  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() { marker.setAnimation(null); }, 1400);
    }
  }

  // This function needs global visibility as it is called from viewModel too
  o.viewMap.getData = function(place, api) {
    marker = place.marker;
    // Create a neighbourMap global variable to reference marker
    // that is currently associated with the infoWindow
    o.viewMap.infoWindowMarker = marker;
    toggleBounce(marker);
    neighbourMap.model.yelpRequest(place.name(), neighbourMap.model.city, yelpSuccess, requestFailed);
    neighbourMap.model.foursquareRequest(place.name(), place.location, foursquareSuccess, requestFailed);
    var formattedContent = '<div id="iw-main">';
    formattedContent += '<div id="iw-links"><span id="iw-yelp">Yelp</span><span id="iw-foursquare">Foursquare</span></div>';
    formattedContent += '</div>';
    console.log(formattedContent);
    infoWindow.setContent(formattedContent);
    infoWindow.open(map, marker);
  };

  function yelpSuccess(data) {
    console.log(data);
    var e0 = data.businesses[0];
    // TODO: look at best way to handle undefined values
    var content = {
      name: e0.name,
      phone: e0.display_phone,
      imgUrl: e0.image_url,
      imgRatingUrl: e0.rating_img_url_small,
      address: e0.location.display_address
    };
    var formattedContent = '<div id="iw-header"><h3>' + content.name + '</h3></div>';
    formattedContent += '<div id="iw-data"><div id="iw-picture"><img src="' + content.imgUrl + '" ';
    formattedContent += 'alt="Picture from yelp"></div>';
    formattedContent += '<div id="iw-detail"><ul><li>Rating: <img src="' + content.imgRatingUrl + '"></li>';
    formattedContent += '<li> Phone: ' + content.phone + '</li>';
    formattedContent += '<li> Address: ' + content.address + '</li>';
    formattedContent += '</ul></div></div>';
    $("#iw-main").append(formattedContent);
  }

  function foursquareSuccess(data) {
    console.log(data);
    var venue = data.response.venue;
    // TODO: look at best way to handle undefined values
    var content = {
      name: venue.name,
      phone: venue.contact.formattedPhone,
      category: venue.categories[0].name,
      imgUrl: venue.bestPhoto.prefix + '100x100' + venue.bestPhoto.suffix,
      address: venue.location.formattedAddress
    };
    var formattedContent = '<div id="iw-header">';
    formattedContent += '<h3>' + content.name + '</h3></div>';
    formattedContent += '<div id="iw-data"><div id="iw-picture"><img src="' + content.imgUrl + '" ';
    formattedContent += 'alt="Picture from foursquare"></div>';
    formattedContent += '<div id="iw-detail"><ul><li>Category: ' + content.category + '</li>';
    formattedContent += '<li> Phone: ' + content.phone + '</li>';
    formattedContent += '<li> Address: ' + content.address + '</li>';
    formattedContent += '</ul></div></div>';
    $("#iw-main").append(formattedContent);
  }

  function requestFailed(data) {
    infoWindow.setContent('<p>Failed to retrieve data from ' + data + '</p>');
    infoWindow.open(map, marker);
  }

})(neighbourMap);