var neighbourMap = neighbourMap || {};

(function(o) {
  'use strict';
  o.viewMap = o.viewMap || {};

  // Make these variables accessible from outside of initMap
  var map, infoWindow, overlay;

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

    // Create an overlay so that we can use it later to get
    // pixel locations of markers
    // Credit to "Flarex" solution in StackOverflow:
    // http://stackoverflow.com/questions/2674392
    overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(map);

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
      place.marker.addListener('click', function() {
        o.viewMap.getData(place);
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

  // Shift the map down when required so that the InfoWindow
  // displays below the Neighbourhood Map header
  function shiftMapDown(marker) {
    var proj = overlay.getProjection();
    var pos = marker.getPosition();
    var p = proj.fromLatLngToContainerPixel(pos);
    if (p.y < 500) {
      map.panBy(0, p.y - 500);
    }
  }

  // Retrieve data about Marker and display in InfoWindow
  // This function needs global visibility as it is called from viewModel too
  o.viewMap.getData = function(place) {
    var marker = place.marker;

    // Create a neighbourMap global variable to reference marker
    // that is currently associated with the infoWindow
    o.viewMap.infoWindowMarker = marker;
    shiftMapDown(marker);
    toggleBounce(marker);
    neighbourMap.model.yelpRequest(place.name(), neighbourMap.model.city, yelpSuccess, requestFailed);
    neighbourMap.model.foursquareRequest(place.name(), place.location, foursquareSuccess, requestFailed);
    var formattedContent = '<div class="iw-main"></div>';
    infoWindow.setContent(formattedContent);
    infoWindow.open(map, marker);
    formattedContent = '<div class="iw-links"></div>';
    $(".iw-main").append(formattedContent);
    formattedContent = '<span id="iw-yelp">Yelp: </span>';
    formattedContent += '<span id="iw-yelp-vis">hide</span>';
    formattedContent += '<span id="iw-foursquare">Foursquare: </span>';
    formattedContent += '<span id="iw-foursquare-vis">hide</span>';
    $(".iw-links").append(formattedContent);
    $("#iw-yelp-vis").on("click", function(e) {
      if (e.toElement.innerHTML === "show") {
        $(".iw-yelp-data").show();
        e.toElement.innerHTML = "hide";
      } else {
        $(".iw-yelp-data").hide();
        e.toElement.innerHTML = "show";
      }
    });
    $("#iw-foursquare-vis").on("click", function(e) {
      if (e.toElement.innerHTML === "show") {
        $(".iw-foursquare-data").show();
        e.toElement.innerHTML = "hide";
      } else {
        $(".iw-foursquare-data").hide();
        e.toElement.innerHTML = "show";
      }
    });
  };

  function yelpSuccess(data) {
    var e0 = data.businesses[0];
    var content = {
      name: e0.name || o.viewMap.infoWindowMarker.title,
      phone: e0.display_phone || "None",
      imgUrl: e0.image_url,
      imgRatingUrl: e0.rating_img_url_small,
      address: e0.location.display_address || "None"
    };
    var formattedContent = '<div class="iw-yelp-data">';
    formattedContent += '<div class="iw-header"><h3>' + content.name + '</h3></div>';
    formattedContent += '<div class="iw-data"><div class="iw-picture"><img src="' + content.imgUrl + '" ';
    formattedContent += 'alt="Picture from yelp"></div>';
    formattedContent += '<div class="iw-detail"><ul><li>Rating: <img src="' + content.imgRatingUrl + '"></li>';
    formattedContent += '<li> Phone: ' + content.phone + '</li>';
    formattedContent += '<li> Address: ' + content.address + '</li>';
    formattedContent += '</ul></div></div></div>';
    $(".iw-main").append(formattedContent);
  }

  function foursquareSuccess(data) {
    var venue = data.response.venue;
    var content = {
      name: venue.name || o.viewMap.infoWindowMarker.title,
      phone: venue.contact.formattedPhone || "None",
      category: venue.categories[0].name || "None",
      imgUrl: venue.bestPhoto.prefix + '100x100' + venue.bestPhoto.suffix,
      address: venue.location.formattedAddress || "None"
    };
    var formattedContent = '<div class="iw-foursquare-data">';
    formattedContent += '<div class="iw-header">';
    formattedContent += '<h3>' + content.name + '</h3></div>';
    formattedContent += '<div class="iw-data"><div class="iw-picture"><img src="' + content.imgUrl + '" ';
    formattedContent += 'alt="Picture from foursquare"></div>';
    formattedContent += '<div class="iw-detail"><ul><li>Category: ' + content.category + '</li>';
    formattedContent += '<li> Phone: ' + content.phone + '</li>';
    formattedContent += '<li> Address: ' + content.address + '</li>';
    formattedContent += '</ul></div></div></div>';
    $(".iw-main").append(formattedContent);
  }

  function requestFailed(data) {
    if (data === "Yelp") {
      var formattedContent = '<div class="iw-yelp-data">';
    } else {
      var formattedContent = '<div class="iw-foursquare-data">';
    }
    formattedContent += '<p>Failed to retrieve data from ' + data + '</p></div>';
    $(".iw-main").append(formattedContent);
  }

})(neighbourMap);
