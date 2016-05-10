var neighbourMap = neighbourMap || {};

(function(o) {
  'use strict';
  o.viewMap = o.viewMap || {};

  // Make these variables accessible from outside of initMap
  var map, infoWindow, overlay, bounds;

  // Create initial map
  o.viewMap.initMap = function() {

    map = new google.maps.Map(document.getElementById('map'), {
      center: neighbourMap.model.centerLocation,
      zoom: 14, // Not strictly required as map will be fitted to markers
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
    // Credit: "Flarex" solution in StackOverflow:
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

    // Create a LatLngBounds object that can be extended with the locations
    // of all Markers
    var bounds = new google.maps.LatLngBounds();
    var markerLatLng;

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

      // Create LatLng object from place position and use it to extend the map bounds
      markerLatLng = new google.maps.LatLng(place.location.lat, place.location.lng);
      bounds.extend(markerLatLng);
    });

    // Fit the map to show all Markers
    map.fitBounds(bounds);
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

  // Shift the map so that Marker x and y pixel position
  // is a minimum of xmin and ymin
  function shiftMap(marker, xmin, ymin) {
    var proj = overlay.getProjection();
    var pos = marker.getPosition();
    var p = proj.fromLatLngToContainerPixel(pos);
    var xoffset = 0;
    var yoffset = 0;
    // Don't move if not necessary but do move if Marker
    // is not currently on displayed section of map
    if (p.x < xmin || p.x > $(document).width() || p.x < 0 ) { xoffset = p.x - xmin; }
    if (p.y < ymin || p.y > $(document).height() || p.y < 0) { yoffset = p.y - ymin; }
    if (xoffset !== 0 || yoffset !== 0) { map.panBy(xoffset, yoffset); }
  }
  // Retrieve data about Marker and display in InfoWindow
  // This function needs global visibility as it is called from viewModel too
  o.viewMap.getData = function(place) {
    var marker = place.marker;
    // Create a neighbourMap global variable to reference marker
    // that is currently associated with the infoWindow
    o.viewMap.infoWindowMarker = marker;
    if ( $(document).width() < 700 ) {
      // On narrow screens shift the map down so that top of InfoWindow is displayed
      shiftMap(marker, 0, 500);
    } else {
      // On wider screens shift the map right as well so InfoWindow is away from place list
      shiftMap(marker, 500, 500);
    }
    toggleBounce(marker);
    // Create initial content for InfoWindow and then open the InfoWindow for the Marker
    var formattedContent = '<div class="iw-main"></div>';
    infoWindow.setContent(formattedContent);
    infoWindow.open(map, marker);
    // Request data from Yelp and Foursquare
    // These are asynchronous requests and the retrieved data
    // are handled by the yelpSuccess and foursquareSuccess callback functions
    neighbourMap.model.yelpRequest(place.name(), neighbourMap.model.city, yelpSuccess, requestFailed);
    neighbourMap.model.foursquareRequest(place.name(), place.location, foursquareSuccess, requestFailed);
    displayInfoWindowLinks();
  };

  // Add a header line to the InfoWindow that can be used to
  // Show/Hide the data from Yelp and Foursquare
  function displayInfoWindowLinks() {
    var formattedContent = '<div class="iw-links"></div>';
    $(".iw-main").prepend(formattedContent);
    formattedContent = '<span class="iw-yelp">Yelp: </span>';
    formattedContent += '<span class="iw-yelp-vis">hide</span>';
    formattedContent += '<span class="iw-foursquare">Foursquare: </span>';
    formattedContent += '<span class="iw-foursquare-vis">hide</span>';
    $(".iw-links").append(formattedContent);
    $(".iw-yelp-vis").on("click", function(e) {
      if (e.target.innerHTML === "show") {
        $(".iw-yelp-data").show();
        e.target.innerHTML = "hide";
      } else {
        $(".iw-yelp-data").hide();
        e.target.innerHTML = "show";
      }
    });
    $(".iw-foursquare-vis").on("click", function(e) {
      if (e.target.innerHTML === "show") {
        $(".iw-foursquare-data").show();
        e.target.innerHTML = "hide";
      } else {
        $(".iw-foursquare-data").hide();
        e.target.innerHTML = "show";
      }
    });
  }

  // Callback function to display Yelp data in InfoWindow
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
    formattedContent += '<div class="iw-header">';
    formattedContent += '<h3 class="iw-header-h3">' + content.name + '</h3></div>';
    formattedContent += '<div class="iw-data"><div class="iw-picture"><img src="' + content.imgUrl + '" ';
    formattedContent += 'alt="Picture from yelp"></div>';
    formattedContent += '<div class="iw-detail"><ul class="iw-detail-ul">';
    formattedContent += '<li class="iw-detail-li">Rating: <img src="' + content.imgRatingUrl + '"></li>';
    formattedContent += '<li class="iw-detail-li">Phone: ' + content.phone + '</li>';
    formattedContent += '<li class="iw-detail-li">Address: ' + content.address + '</li>';
    formattedContent += '</ul></div></div></div>';
    $(".iw-main").append(formattedContent);
  }

  // Callback function to display Foursquare data in InfoWindow
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
    formattedContent += '<h3 class="iw-header-h3">' + content.name + '</h3></div>';
    formattedContent += '<div class="iw-data"><div class="iw-picture"><img src="' + content.imgUrl + '" ';
    formattedContent += 'alt="Picture from foursquare"></div>';
    formattedContent += '<div class="iw-detail"><ul class="iw-detail-ul">';
    formattedContent += '<li class="iw-detail-li">Category: ' + content.category + '</li>';
    formattedContent += '<li class="iw-detail-li">Phone: ' + content.phone + '</li>';
    formattedContent += '<li class="iw-detail-li">Address: ' + content.address + '</li>';
    formattedContent += '</ul></div></div></div>';
    $(".iw-main").append(formattedContent);
  }

  // Callback function to display error message in InfoWindow
  // if data can not be retrieved via Yelp or Foursquare APIs
  function requestFailed(data) {
    var formattedContent;
    if (data === "Yelp") {
      formattedContent = '<div class="iw-yelp-data">';
    } else {
      formattedContent = '<div class="iw-foursquare-data">';
    }
    formattedContent += '<p>Failed to retrieve data from ' + data + '</p></div>';
    $(".iw-main").append(formattedContent);
  }

})(neighbourMap);
