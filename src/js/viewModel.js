var neighbourMap = neighbourMap || {};

(function(o) {
  'use strict';
  o.viewModel = o.viewModel || {};

  // Define Place
  var Place = function(data) {
    this.name = ko.observable(data.name);
    this.location = data.location;
    this.visible = ko.observable(true);
  };

  var ViewModel = function() {
    var self = this;

    // List view. Not visible to start with
    self.listVisible = ko.observable(false);

    // Populate am observable array with all the places defined in the model
    self.placeList = ko.observableArray();
    neighbourMap.model.initialPlaces.forEach(function(place) {
      self.placeList.push(new Place(place));
    });

    // Sort array of places by place name
    self.placeList.sort(function(l, r) {
      return l.name().localeCompare(r.name());
    });

    // Function called when hamburger icon clicked
    self.toggleListVisible = function() {
      self.listVisible() ?
        self.listVisible(false) :
        self.listVisible(true);
    };

    // Initialize text in filter input
    self.filterText = ko.observable('');

    // Function called whenever anything is typed into Filter field
    // Sets visibility of list items and map markers
    // Closes infoWindow if it's marker is removed
    self.filterPlaceList = function() {
      self.placeList().forEach(function(place) {
        if (place.name().search(self.filterText()) > -1) {
          place.visible(true);
          place.marker.setVisible(true);
        } else {
          place.visible(false);
          place.marker.setVisible(false);
          // Check to see if the marker is currently associated with the infoWindow
          // Close the infoWindow if it is
          if (place.marker === neighbourMap.viewMap.infoWindowMarker) {
            neighbourMap.viewMap.infoWindow.close();
          }
        }
      });
    };

    // Function called when a place name in the list is clicked
    // Results in data being displayed on map. Same as if the marker had been clicked
    self.selectPlace = function(clickedPlace) {
      neighbourMap.viewMap.getData(clickedPlace);
    };
  };

  o.viewModel.ViewModel = new ViewModel();
  ko.applyBindings(o.viewModel.ViewModel);

})(neighbourMap);
