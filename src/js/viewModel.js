var neighbourMap = neighbourMap || {};

(function(o) {
  'use strict';
  o.viewModel = o.viewModel || {};

  // Define Place
  var Place = function(data) {
    this.name = ko.observable(data.name);
    this.location = data.location;
  };

  var ViewModel = function() {
    var self = this;
    self.placeListVisible = ko.observable(false);

    self.placeList = ko.observableArray([]);

    neighbourMap.model.initialPlaces.forEach(function(place) {
      self.placeList.push(new Place(place));
    });

    self.togglePlaceListVisible = function() {
      if (self.placeListVisible()) {
        self.placeListVisible(false);
      } else {
        self.placeListVisible(true);
      }
    };

    this.currentPlace = ko.observable(this.placeList()[0]);

    this.selectPlace = function(clickedPlace) {
      self.currentPlace(clickedPlace);
      console.log(self.currentPlace());
      neighbourMap.viewMap.getData(self.currentPlace());
    };
  };

  o.viewModel.ViewModel = new ViewModel();
  ko.applyBindings(o.viewModel.ViewModel);

})(neighbourMap);