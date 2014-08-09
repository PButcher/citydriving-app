var session = {

	// Settings
	settingLFSUsername: "",
	settingBuddyList: [],
	settingRefreshRate: 10000,
	settingLaunchScreen: "true",

	// Data
	statsData: "",
	lookupData: "",
	splashSpeed: 750,
	view: "home",
	baseUrl: "http://insim.city-driving.co.uk/",
	apiUrl: "api.php",
	statsUrl: "stats.php",
	username: "",
	buddiesOnlineOne: "",
	buddiesOnlineTwo: "",

	// Current ajax request
	xhr: 0,

	// Current clock componenet
	currentClock: ""
}

$(document).ready(function() {

	getSettings();
	initialise();
});

var initialise = function() {

	$.ajaxSetup({
		timeout: 10000
	});

	// session.settingBuddyList = JSON.parse(session.settingBuddyList);

	if(session.settingLaunchScreen == "true") {
		splash();
	} else {
		transition(0, 1);
		$('#content, header, .menu').show();
	}

	$('#logo').click(function() {
		transition(session.view, 1);
	});

	$('#welcome-username').keyup(function() {
		if($(this).val() == "") {
			session.settingLFSUsername = "";
			$('#welcome-lfs-message').hide();
			$('#welcome-next').hide();
		} else {
			session.settingLFSUsername = $(this).val();
			lfsUsernameRequest();
		}
	})

	$('#username-field').keyup(function(){
		if($(this).val() == "") {
			clearLookup();
			session.username = "";
		} else {
			session.username = $(this).val();
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

	// settings

	$('#setting-lfs-username').click(function() {
		session.settingLFSUsername = "";
		setSettings();
		transition(session.view, 1);
	});

	$('#setting-launch').click(function() {
		if(session.settingLaunchScreen == "true") {
			$('#setting-launch i').attr('class', 'fa fa-square');
			session.settingLaunchScreen = "false";
		} else {
			$('#setting-launch i').attr('class', 'fa fa-check-square');
			session.settingLaunchScreen = "true";
		}
		setSettings();
	});

	$('#setting-refresh').click(function() {
		if(session.settingRefreshRate == 10000) {
			session.settingRefreshRate = 0;
			$('#setting-refresh i').attr('class', 'fa fa-square');
			stopClock();
		} else {
			session.settingRefreshRate = 10000;
			$('#setting-refresh i').attr('class', 'fa fa-check-square');
			homeRequest();
			session.currentClock = clock("home");
		}
		setSettings();
	});

	$('#setting-buddy-list').click(function() {
		$('#setting-buddy-list-setting').hide();
		session.settingBuddyList = [];
		setSettings();
	});
}

var transition = function(src, dest) {

	stopClock();

	switch(dest) {
		case 1:
			session.view = "home";
			hideLoader();
			if(session.settingLFSUsername == "") {
				$('#server-statistics').hide();
				$('#menu').hide();
				$('#welcome').show();
			} else {
				$('#server-statistics').show();
				homeRequest();
				session.currentClock = clock("home");
			}
			break;
		case 2:
			session.view = "stats";
			statsRequest();
			break;
		case 3:
			session.view = "lookup";
			lookupRequest();
			session.currentClock = clock("home");
			break;
		case 4:
			session.view = "vin";
			break;
		case 5:
			session.view = "settings";
			session.currentClock = clock("home");
			getSettings();
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

	if(session.settingRefreshRate != 0) {
		if (component == "home") {
			console.log("clock started: home");
			return window.setInterval(function() {
				session.xhr.abort();
				homeRequest();
				console.log("tick: home");
			}, session.settingRefreshRate);
		}
	}
}

var stopClock = function() {

	if (session.settingRefreshRate != 0) {
		window.clearInterval(session.currentClock);
		console.log("clock stopped: " + session.currentClock);
	} else {
		window.clearInterval(session.currentClock);
		console.log("clock disabled");
	}
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
	console.log(object);
	console.log(element);
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