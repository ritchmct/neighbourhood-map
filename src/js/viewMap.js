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

    // Create a marker for each place in the placeList
    neighbourMap.viewModel.ViewModel.filteredPlaceList().forEach(function(place) {
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
  }

  // This function needs global visibility as it is called from viewModel too
  o.viewMap.getData = function(place) {
    // console.log(place);
    marker = place.marker;
    toggleBounce(marker);
    neighbourMap.model.yelpRequest(place.name(), neighbourMap.model.city, yelpSuccess, yelpFail);
  }

  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() { marker.setAnimation(null) }, 1400);
    }
  }

  function yelpSuccess(data) {
    console.log(data);
    var e0 = data.businesses[0];
    // TODO: look at best way to handle undefined values
    var content = {
      name: e0.name,
      phone: e0.display_phone,
      imgUrl: e0.image_url,
      imgRatingUrl: e0.rating_img_url_small,
      address: e0.location.address[0]
    };
    var formattedContent = '<div id="iw-main">';
    formattedContent += '<div id="iw-image"><img src="' + content.imgUrl + '"></div>';
    formattedContent += '<div><ul><li>' + content.name + '</li></ul></div>';
    formattedContent += '</div>';
    console.log(formattedContent);
    infoWindow.setContent(formattedContent);
    // yelpInfoWindow();
    // console.log(infoWindow.getContent());
    infoWindow.open(map, marker);
    // var output = JSON.stringify(data, null, 2);
    // $("body").append(output);
  }

  function yelpFail() {
    infoWindow.setContent('<p>Failed to retrieve data from yelp</p>');
    infoWindow.open(map, marker);
  }

  function yelpInfoWindow() {
    // var phone =
    var content = document.createElement('div');
    content.className = "yelpInfoWindow";
    $(".yelpInfoWindow").append("<p>test</p>");
    console.log(content);
  };

})(neighbourMap);