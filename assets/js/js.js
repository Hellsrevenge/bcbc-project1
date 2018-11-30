var dangerStat = [];

var longLatAssault = {
    x: [],
    y: []
};

var longLatTheft = {
    x: [],
    y: []

};

var longLatBurglary = {
    x: [],
    y: []
};

var longLatRobbery = {
    x: [],
    y: []
};

var longLatVehicleTheft = {
    x: [],
    y: []
};


$.ajax({
    url: "https://data.sfgov.org/resource/cuks-n6tp.json",
    type: "GET",
    data: {
        "$limit": 5000,
        "$$app_token": "Q6SHiWLggs1tj51Wp1Y9CagsX"
    }
}).done(function (data) {
    //alert("Retrieved " + data.length + " records from the dataset!");
    //console.log(data);
    dangerData(data);
    sortData(data);
    console.log(longLatBurglary);
});

function dangerData(data) {
    for (var i = 0; i < 5000; i++) {
        if (data[i].category == "ASSAULT" || data[i].category == "LARCENY/THEFT" || data[i].category == "BURGLARY" || data[i].category == "ROBBERY" || data[i].category == "VEHICLE THEFT") {
            dangerStat[i] = data[i];
        }
    }
}

function sortData(dangerStat) {
    var j = 0;
    for (var i = 0; i < 5000; i++) {

        if (dangerStat[i].category == "ASSAULT") {
            longLatAssault.x.push(dangerStat[i].x);
            longLatAssault.y.push(dangerStat[i].y);

        } else if (dangerStat[i].category == "LARCENY/THEFT") {
            longLatTheft.x.push(dangerStat[i].x);
            longLatTheft.y.push(dangerStat[i].y);

        } else if (dangerStat[i].category == "BURGLARY") {
            longLatBurglary.x.push(dangerStat[i].x);
            longLatBurglary.y.push(dangerStat[i].y);

        } else if (dangerStat[i].category == "ROBBERY") {
            longLatRobbery.x.push(dangerStat[i].x);
            longLatRobbery.y.push(dangerStat[i].y);

        } else if (dangerStat[i].category == "Vehicle Theft") {
            longLatVehicleTheft.x.push(dangerStat[i].x);
            longLatVehicleTheft.y.push(dangerStat[i].y);
        }

    }

}


$(document).ready(function () {
    firebase.initializeApp(config.firebase);
    var database = firebase.database();

    var name = "";
    var phone = "";

    $("#logInBnt").on("click", function (event) {
        event.preventDefault();
        name = $("#inlineFormInput").val().trim();
        phone = $("#inlineFormInputGroup").val().trim();

        database.ref().set({
            name: name,
            phone: phone
        });
    });

    database.ref().on("value", function (snapshot) {
        $("#emergency-link").text(snapshot.val().name).attr("href", "tel:" + snapshot.val().phone)
    });

    $("#run-search").on("click", function (event) {
        $(".popup-bg").show();
        $(".popup-buttons").show();
        $(".popup-bg").on("click", function (event) {
            $(".popup-bg").hide();
            $(".popup-buttons").hide();
        });
    });
});

function initMap() {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var san_francisco = new google.maps.LatLng(37.773972, -122.431297);
    var mapOptions = {
        mapTypeControl: false,
        zoom: 12,
        center: san_francisco
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);
    new AutocompleteDirectionsHandler(map);

    var marker = new google.maps.Marker({
        position: {
            lat: 37.8720,
            lng: -122.2713
        },
        map: map,
        draggable: true
    });

    var searchBox = new google.maps.places.SearchBox(document.getElementById('mapsearch'));

    google.maps.event.addListener(searchBox, 'places_changed', function () {
        var places = searchBox.getPlaces();
        var bounds = new google.maps.LatLngBounds();
        var i, place;

        for (i = 0; place = places[i]; i++) {

            bounds.extend(place.geometry.location);
            marker.setPosition(place.geometry.location);
        }
        map.fitBounds(bounds);
        mpa.setZoom(10);
    })

}

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, {placeIdOnly: true});
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, {placeIdOnly: true});

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route({
        origin: {'placeId': this.originPlaceId},
        destination: {'placeId': this.destinationPlaceId},
        travelMode: this.travelMode
    }, function (response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};

function calcRoute() {
    var start = document.getElementById('origin-input').value;
    var end = document.getElementById('destination-input').value;
    var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
}
