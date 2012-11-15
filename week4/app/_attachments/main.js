$('#index').on('pageinit', function(){
	//code needed for home page goes here
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
	
	// loops through form and resets values
	$('#resetFormButton').on('click', resetForm);
});

$('#browse').on('pageinit', function(){
	$('#Business').data('cat', 'Business').on('click', getData);
	$('#Education').data('cat', 'Education').on('click', getData);
	$('#Family').data('cat', 'Family').on('click', getData);
	$('#Vacation').data('cat', 'Vacation').on('click', getData);
	$('#Other').data('cat', 'Other').on('click', getData);
});

$('#browse').on('pageshow', function(){
	$('#catThumbnailGrid span').css('textShadow', 'none');
	$('#browseTripList').html('');
	$('#selectMsg').css('display', 'block');
});

$('#search').on('pageshow', function(){
	getData();
});

$('#moreInfo').on('pageinit', function(){
	$('#clearAllData').on('click', clearData);
});

//The functions below can go inside or outside the pageinit function for the page in which it is needed.

var getData = function(){
	var labels = ["Travel Method: ", "Trip Type: ", "Destination: ", "Date: ", "Number of People: ", "Notes: "];
	
	// figure out where these entries are going to be appended (search or browse page)
	if ($(this).data('cat')) {
		console.log('browsing');
		var appendLocation = $('#browseTripList').html('');
		catFilter = $(this).data('cat');
		var ajaxURL = 'app/' + catFilter.toLowerCase() + '/';
		$('#catThumbnailGrid span').css('textShadow', 'none');
		$('#catLabel' + catFilter).css('textShadow', '0 0 3px #F90');
		$('#selectMsg').css('display', 'none');
	} else {
		console.log('searching');
		var appendLocation = $('#searchTripList').html('');
		var ajaxURL = "app/all/";
	}
	
	$.couch.db('trip-planner').view(ajaxURL, {
		success: function(data){
			console.log(data);
			$.each(data.rows, function(index, trip){
				var makeEntry = $('<div>')
					.attr('data-role', 'collapsible')
					.attr('data-mini', 'true')
					.attr('id', trip.key)
					.appendTo(appendLocation)
				;
				
				var makeH3 = $('<h3>')
					.html(trip.value.dest + ' - ' + trip.value.date)
					.appendTo(makeEntry)
				;
				
				var makeDetailsList = $('<ul>').appendTo(makeEntry);
				var labelCounter = 0;
				for (var k in trip.value) {
					var makeLi = $('<li>')
						.html(labels[labelCounter] + trip.value[k])
						.appendTo(makeDetailsList)
					;
					labelCounter++;
				}
				
				// create edit/delete buttons for each entry
				var buttonHolder = $('<div>').attr('class', 'ui-grid-a').appendTo(makeEntry);
				var editButtonDiv = $('<div>').attr('class', 'ui-block-a').appendTo(buttonHolder);
				var removeButtonDiv = $('<div>').attr('class', 'ui-block-b').appendTo(buttonHolder);
				var editButton = $('<a>')
					.attr('data-role', 'button')
					.attr('href', '#addItem')
					.html('Edit')
					.data('key', trip.key[0])
					.data('rev', trip.key[1])
					.appendTo(editButtonDiv)
					.on('click', editTrip)	
				;
				var removeButton = $('<a>')
					.attr('data-role', 'button')
					.attr('href', '#')
					.html('Remove')
					.data('key', trip.key[0])
					.data('rev', trip.key[1])
					.appendTo(removeButtonDiv)
					.on('click', removeTrip)
				;
				console.log(trip.key[0]);
				console.log(trip.key[1]);
				$(makeEntry).trigger('create');
			});
			$(appendLocation).trigger('create');
		}
	});
};

var storeData = function(data){
	var key = $('#addTripButton').data('key');
	var rev = $('#addTripButton').data('rev');
	console.log(key);
	console.log(rev);
	var trip = {};

	if (rev) {		// updating existing document
		trip._id = key;
		trip._rev = rev;
	}
	
	// add the rest of the data
	trip.type = data[0].value;
	trip.method = data[1].value;
	trip.dest = data[2].value;
	trip.date = data[3].value;
	trip.people = data[4].value;
	trip.notes = data[5].value;
	
	console.log(trip);
	
	$.couch.db('trip-planner').saveDoc(trip, {
		success: function(trip){
			alert('Trip Saved!');
			resetForm();
			$('#addTripButton').attr('value', 'Add Trip').removeData('key').removeData('rev');
			$.mobile.changePage('#index');
		}
	});
}; 

var editTrip = function (){
	var key = $(this).data('key');
	var rev = $(this).data('rev');
	
	$.couch.db('trip-planner').openDoc(key,{
		success: function(trip) {
			$('#tripType').val(trip.type);
			$('#dest').val(trip.dest);
			$('#date').val(trip.date);
			$('#numPeople').val(trip.people);
			$('#notes').val(trip.notes);
			$('form input:radio').each(function(index, value){
				// check for a match to the travel method
				if ($(this).attr('id') === trip.method.toLowerCase()) {
					$(this).attr('checked', true);
				} else {
					$(this).attr('checked', false);
				}
			});
			$('#addTripButton').attr('value', 'Update Trip').data('key', key).data('rev', rev);
		}
	});
};

var	removeTrip = function (){
	var ask = confirm("Are you sure you want to remove this trip?");
	if (ask) {
		var doc = {
				'_id': $(this).data('key'),
				'_rev': $(this).data('rev')
		};
		$.couch.db('trip-planner').removeDoc(doc, {
			success: function(data){
				alert("Trip Removed!");
				console.log('');
				window.location.reload();
			}
		});
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

function resetForm () {
	$('form input:radio').each(function(index, value){
		$(this).removeAttr('checked').checkboxradio('refresh');
	});
	$('#numPeople').val('1');
};


