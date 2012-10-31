$('#index').on('pageinit', function(){
	//code needed for home page goes here
	$('#clearAllData').on('click', clearData);
	$('#Business').on('click', getData);
	$('#Education').on('click', getData);
	$('#Family').on('click', getData);
	$('#Vacation').on('click', getData);
	$('#Other').on('click', getData);
});	
		
$('#addItem').on('pageinit', function(){
	delete $.validator.methods.date;
	var myForm = $('#addTripForm');
	myForm.validate({
		invalidHandler: function(form, validator) {
		},
		submitHandler: function() {
			var data = myForm.serializeArray();
			storeData(data);
		}
	});
	
	//any other code needed for addItem page goes here
	
	// loops through form and resets values
	$('#resetFormButton').on('click', resetForm);
	function resetForm () {
		$('form input:radio').each(function(index, value){
			$(this).removeAttr('checked').checkboxradio('refresh');
		});
		$('#numPeople').val('1');
	}
});

$('#search').on('pageshow', function(){
	getData(false);
});

$('#moreInfo').on('pageinit', function(){
	$('#getJSON').on('click', autoFillData);
	$('#getXML').on('click', autoFillData);
	$('#getCSV').on('click', autoFillData);
});

//The functions below can go inside or outside the pageinit function for the page in which it is needed.

var autoFillData = function (){
	// gets button name to determine which type of AJAX call to make
	console.log($(this).attr('id'));
 	var type = $(this).attr('id');
 	
 	if (type === 'getJSON') {
  		$.ajax({
			url: 'xhr/data.json',
			type: 'GET',
			dataType: 'json',
			success: function(result){
				for (var n in result) {
					var id = Math.floor(Math.random()*1000000);
					localStorage.setItem(id, JSON.stringify(result[n]));
				}
				alert('JSON Data Successfully Loaded');
			}
		});
	}
};

var getData = function(browsing){
	if (localStorage.length === 0) {
		alert("There are no saved trips, so default data was added.");
		autoFillData();
	}

	// figure out where these entries are going to be appended (search or browse page)
	if (browsing) {
		var appendLocation = $('#browseTripList').html("");
		catFilter = this.id;
		$('#catLabelBusiness').css('textShadow', 'none');
		$('#catLabelEducation').css('textShadow', 'none');
		$('#catLabelFamily').css('textShadow', 'none');
		$('#catLabelVacation').css('textShadow', 'none');
		$('#catLabelOther').css('textShadow', 'none');
		$('#catLabel' + catFilter).css('textShadow', '0 0 3px #F90');
		$('#selectMsg').css('display', 'none');
	} else {
		var appendLocation = $('#searchTripList').html("");
	}
	
	
	// make collapsible mini's for each trip entry
	for (var i = 0, j = localStorage.length; i < j; i++) {
		var key = localStorage.key(i);
		var value = localStorage.getItem(key);
		var obj = JSON.parse(value);
		
		// check for browsing and filter
		if (browsing) {
			if (obj.type[1] === catFilter) {
				goodToGo = true;
			} else {
				goodToGo = false;
			}
		} else {
			goodToGo = true;
		}
		
		if (goodToGo) {
			// creates collapsible for trip data
			var makeEntry = $('<div></div>')
				.attr('data-role', 'collapsible')
				.attr('data-mini', 'true')
				.attr('id', key)
				.appendTo(appendLocation)
			;
			
			var makeH3 = $('<h3></h3>')
				.html(obj.dest[1] + " - " + obj.date[1])
				.appendTo(makeEntry)
			;
			
			// Create List of Trip Details
			var makeList = $('<ul></ul>').appendTo(makeEntry);
			for (var k in obj) {
				var makeLi = $('<li></li>')
					.html(obj[k][0] + " " + obj[k][1])
					.appendTo(makeList)
				;
			}
			
			// Create Links to Edit/Delete
			var buttonHolder = $('<div></div>').attr('class', 'ui-grid-a').appendTo(makeEntry);
			var editButtonDiv = $('<div></div>').attr('class', 'ui-block-a').appendTo(buttonHolder);
			var removeButtonDiv = $('<div></div>').attr('class', 'ui-block-b').appendTo(buttonHolder);
			var editButton = $('<a></a>')
				.attr('data-role', 'button')
				.attr('href', '#addItem')
				.html('Edit')
				.data('key', key)
				.appendTo(editButtonDiv)
				.on('click', editTrip)	//This function wasn't working/hasn't been added yet
			;
			var removeButton = $('<a></a>')
				.attr('data-role', 'button')
				.attr('href', '#')
				.html('Remove')
				.data('key', key)
				.appendTo(removeButtonDiv)
				.on('click', removeTrip)
			;
			$(makeEntry).trigger('create');
		}
		$(appendLocation).trigger('create');
	}
};

var storeData = function(data){
	key = $('#addTripButton').data('key');
	if (!key) {
		var id = Math.floor(Math.random()*1000000);
	} else {
		var id = key;
	}
	var trip = {};
		trip.type = ["Trip Type: ", data[0].value];
		trip.method = ["Travel Method: ", data[1].value];
		trip.dest = ["Destination: ", data[2].value];
		trip.date = ["Date: ", data[3].value];
		trip.people = ["Number of People: ", data[4].value];
		trip.notes = ["Notes: ", data[5].value];
		
		// Save data into local storage, use Stringify to convert object to string
		localStorage.setItem(id, JSON.stringify(trip));
		$('#addTripButton').html('Add Trip').removeData('key');
		alert("Trip Saved!");
		resetForm();
		$.mobile.changePage('#index');
		
}; 

var editTrip = function (){
	var key = $(this).data('key');
	var stuff = localStorage.getItem(key);
	var trip = JSON.parse(stuff);
	
	// maybe change Add Trip in footer to Update Trip
	$('#tripType').val(trip.type[1]);
	$('#dest').val(trip.dest[1]);
	$('#date').val(trip.date[1]);
	$('#numPeople').val(trip.people[1]);
	$('#notes').val(trip.notes[1]);
	
	$('form input:radio').each(function(index, value){
		// check for match to the travel method
		if ($(this).attr('id') === trip.method[1].toLowerCase()) {
			$(this).attr('checked', true); //.checkboxradio('refresh');
		} else {
			$(this).removeAttr('checked');
		}
	});
	$('#addTripButton').html('Update Trip').data('key', key);
	$('#radios').trigger('create');
};

var	removeTrip = function (){
	var ask = confirm("Are you sure you want to remove this trip?");
	if (ask) {
		localStorage.removeItem($(this).data('key'));
		window.location.reload();
	} else {
		alert("Trip was not removed.");
	}		
};
					
var clearData = function(){
	if (localStorage.length === 0) {
			alert("There are no saved trips to clear.");
		} else {
			localStorage.clear();
			alert("All saved trips have been cleared.");
			window.location.reload();
			return false;
		}
};


