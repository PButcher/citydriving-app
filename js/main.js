var session = {

	// Settings
	settingBuddyList: "[]",
	settingRefreshRate: 15000,

	// Data
	statsData: "",
	lookupData: "",
	splashSpeed: 0,
	view: "home",
	baseUrl: "http://insim.city-driving.co.uk/",
	apiUrl: "api.php",
	statsUrl: "stats.php",
	username: "",

	// Current ajax request
	xhr: 0,

	// Current clock componenet
	currentClock: ""
}

$(document).ready(function() {

	initialise();
	getSettings();
});

var initialise = function() {

	session.settingBuddyList = JSON.parse(session.settingBuddyList);

	splash();

	$('#username-field').keyup(function(){
		if($(this).val() == "") {
			clearLookup();
		} else {
			session.username = $('#username-field').val();
			session.xhr.abort();
			lookupRequest();
		}
	});
	$('.menu-item').click(function() {
		var dest = parseInt($(this).attr('id').charAt(1));
		transition(session.view, dest);
	});
	$('.add-to-buddy-list').click(function() {
		push2JSON(session.settingBuddyList, {"username": session.lookupData.username});
		setSettings();
		lookupRequest();
	});
	$('.remove-from-buddy-list').click(function() {
		for (var i = 0; i < session.settingBuddyList.length; i++) {
			if (session.settingBuddyList[i].username.toLowerCase() == session.lookupData.username.toLowerCase()) {
				session.settingBuddyList.splice(i, 1);
			}
		}
		setSettings();
		lookupRequest();
	});
}

var transition = function(src, dest) {

	switch(dest) {
		case 1:
			session.view = "home";
			homeRequest();
			session.currentClock = clock("home");
			break;
		case 2:
			session.view = "stats";
			statsRequest();
			break;
		case 3:
			session.view = "lookup";
			lookupRequest();
			break;
		case 4:
			session.view = "vin";
			break;
		case 5:
			session.view = "settings";
			break;
	}

	if (src != session.view) {
		$('#menu').children().removeClass('selected');
		var destSelector = '#m' + dest;
		$(destSelector).addClass('selected');
		src = '#' + src;
		dest = '#' + session.view;
		$(src).hide();
		$(dest).show();
	}
}

var splash = function() {
	$('#splash').show(setTimeout(function() {
		$('#splash-logo').fadeIn(session.splashSpeed);
		setTimeout(function() {
			$('#splash-logo').fadeOut(session.splashSpeed);
			setTimeout(function() {
				$('#splash').fadeOut(session.splashSpeed);
				setTimeout(function(){
					$('#content, header, .menu').fadeIn(session.splashSpeed);
					transition(0, 1);
				}, session.splashSpeed);
			}, session.splashSpeed);
		}, session.splashSpeed * 3);
	}, session.splashSpeed));
}

function clock(component) {

	if (component == "home") {
		return window.setInterval(function() {
			session.xhr.abort();
			homeRequest();
		}, session.settingRefreshRate);
	}
}

var stopClock = function() {

	window.clearInterval(session.currentClock);
}

// Clear all statistics outputs
var clearLookup = function() {
	$('#online-status').hide();
	$('#username').text("");
	$('#lookup-country img').attr('src', '');
	$('#lookup-country img').hide();
	$('#lookup-country span').text("");
	$('#join-date').text("");
	$('#last-seen').text("");
	$('#add-to-buddy-list').hide();
	$('#remove-from-buddy-list').hide();
}

// Pad a number with leading zeros
var pad = function(number) {
	var number = number+"";
	while (number.length < 2) {
		number = "0" + number;
	}
	return number;
}

// Push to JSON object
var push2JSON = function(object, element) {
	object.push(element);
	return JSON.stringify(object);
}

var showLoader = function() {
	$('#loading-no-connection').hide();
	$('#loading').show();
}
var hideLoader = function() {
	$('#loading-no-connection').hide();
	$('#loading').hide();
}
var noConnection = function() {
	hideLoader();
	$('#loading-no-connection').show();
}