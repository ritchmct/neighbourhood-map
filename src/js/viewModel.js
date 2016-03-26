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
    // Initialize observable array that will contain only the places which match the filter
    // self.filteredPlaceList = ko.observableArray([]);

    // Populate a normal array with all the places defined in the model
    self.placeList = ko.observableArray();
    neighbourMap.model.initialPlaces.forEach(function(place) {
      self.placeList.push(new Place(place));
    });

    // Sort array of places by place name
    self.placeList.sort(function(l, r) {
      var x = l.name();
      var y = r.name();
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    // Function called when hamburger icon clicked
    self.toggleListVisible = function() {
      if (self.listVisible()) {
        self.listVisible(false);
      } else {
        self.listVisible(true);
      }
    };

    // Initialize text in filter input
    self.filterText = ko.observable('');

    // Function called whenever anything is typed into Filter field
    // Clears filteredPlaceList observable array and repopulates with only
    // entries that match text typed in Filter field
    // TODO: Need to look at removing markers too
    self.filterPlaceList = function() {
      self.placeList().forEach(function (place) {
        // console.log(self.filterText(), place.name(), place.name().search(self.filterText()));
        if (place.name().search(self.filterText()) > -1) {
          place.visible(true);
        } else {
          place.visible(false);
        }
      });
    };

    // Run function for initial list (copies all places into filteredPlaceList array)
    // self.filterPlaceList();

    // self.currentPlace = ko.observable(this.filteredPlaceList()[0]);

    // Function called when a place name in the list is clicked
    // Results in data being displayed on map. Same as if the marker had been clicked
    self.selectPlace = function(clickedPlace) {
      // self.currentPlace(clickedPlace);
      // console.log(clickedPlace);
      neighbourMap.viewMap.getData(clickedPlace);
    };
  };

  o.viewModel.ViewModel = new ViewModel();
  ko.applyBindings(o.viewModel.ViewModel);

})(neighbourMap);