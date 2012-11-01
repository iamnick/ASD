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
 	var type = $(this).attr('id');
 	
 	if (type === 'getJSON') {
  		$.ajax({
			url: 'xhr/data.json',
			type: 'GET',
			dataType: 'json',
			success: function(result){
				console.log('JSON loaded');
				console.log(result);
				for (var n in result) {
					var id = Math.floor(Math.random()*1000000);
					console.log(JSON.stringify(result[n]));
					localStorage.setItem(id, JSON.stringify(result[n]));
				}
				alert('JSON Data Successfully Loaded');
			},
			error: function(result){
				alert('There was an error loading the JSON file.');
				console.log(result);
			}
		});
	} else if (type === 'getXML') {
		$.ajax({
			url: 'xhr/data.xml',
			type: 'GET',
			dataType: 'xml',
			success: function(result){
				console.log('XML Loaded');
				console.log(result);
				$(result).find('trip').each(function(){
					var item = $(this);
					var string = "";
					string += '{"method":"' + item.find('method').text() + '",';
					string += '"type":"' + item.find('type').text() + '",';
					string += '"dest":"' + item.find('dest').text() + '",';
					string += '"date":"' + item.find('date').text() + '",';
					string += '"people":"' + item.find('people').text() + '",';
					string += '"notes":"' + item.find('notes').text() + '"}';
					console.log(string);
					
					var id = Math.floor(Math.random()*1000000);
					localStorage.setItem(id, string);
				});
				alert('XML Data Successfully Loaded');
			},
			error: function(result){
				alert('There was an error loading the XML file.');
				console.log(result);
			}
		});
	} else if (type === 'getCSV') {
		$.ajax({
			url: 'xhr/data.csv',
			type: 'GET',
			dataType: 'text',
			success: function(result){
				console.log('CSV Loaded');
				console.log(result);
				
				var lines = result.split('\n');
				var keys = lines[0].split("|");
				
				for (var i = 1; i < lines.length; i++) {
					var row = lines[i]
					var columns = row.split("|");
					var string = '{';
					for (var j = 0; j < columns.length; j++) {
						string += '"' + keys[j] + '":"' + columns[j] + '",';
					}
					string = string.slice(0, -1);
					string += '}';
					
					var id = Math.floor(Math.random()*1000000);
					localStorage.setItem(id, string);
				}
				alert('CSV Data Successfully Loaded');
			},
			error: function(result){
				alert('There was an error loading the CSV file.');
				console.log(result);
			}
		});
	}
	$.mobile.changePage($('#search'));
};

var getData = function(browsing){
	var labels = ["Travel Method: ", "Trip Type: ", "Destination: ", "Date: ", "Number of People: ", "Notes: "];
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
				.html(obj.dest + " - " + obj.date)
				.appendTo(makeEntry)
			;
			
			// Create List of Trip Details
			var makeList = $('<ul></ul>').appendTo(makeEntry);
			var counter = 0;
			for (var k in obj) {
				var makeLi = $('<li></li>')
					.html(labels[counter] + obj[k])
					.appendTo(makeList)
				;
				counter++;
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
		trip.type = data[0].value;
		trip.method = data[1].value;
		trip.dest = data[2].value;
		trip.date = data[3].value;
		trip.people = data[4].value;
		trip.notes = data[5].value;
		
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
	$('#tripType').val(trip.type);
	$('#dest').val(trip.dest);
	$('#date').val(trip.date);
	$('#numPeople').val(trip.people);
	$('#notes').val(trip.notes);
	
	$('form input:radio').each(function(index, value){
		// check for match to the travel method
		if ($(this).attr('id') === trip.method.toLowerCase()) {
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


