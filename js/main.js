var session = {

	// Settings
	settingLFSUsername: "",
	settingBuddyList: [],
	settingRefreshRate: 15000,
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

	// Allow :active styles in CSS
	document.addEventListener("touchstart", function(){}, true);

	$.ajaxSetup({
		timeout: 15000
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
		var tempLFSUsername = session.settingLFSUsername;
		$('#welcome-username').val(session.settingLFSUsername);
		lfsUsernameRequest();
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
		if(session.settingRefreshRate == 15000) {
			session.settingRefreshRate = 0;
			$('#setting-refresh i').attr('class', 'fa fa-square');
			stopClock();
		} else {
			session.settingRefreshRate = 15000;
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

	// offline 

	$('#offline a').click(function() {
		homeRequest();
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
			session.view = "lookup";
			lookupRequest();
			session.currentClock = clock("home");
			break;
		case 3:
			session.view = "vin";

			break;
		case 4:
			session.view = "buddies";
			buddiesRequest();
			session.currentClock = clock("home");
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
	$('#lookup-table').hide();
	$('#lookup-identity').hide();
	$('#lookup-garage').hide();
	$('#lookup-group').hide();
	$('#online-status').hide();
	$('#username').text("");
	$('#lookup-nickname').html("");
	$('#lookup-admin').hide();
	$('#lookup-country img').attr('src', '');
	$('#lookup-country img').hide();
	$('#lookup-country span').text("");
	$('#join-date').text("");
	$('#last-seen').text("");
	$('#lookup-money').text("");
	$('#lookup-distance').text("");
	$('#lookup-time').text("");
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
// Return a number separated by commas
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
	clearLookup();
	$('#loading-no-connection').show();
	$('#offline').show();
}
var sanitiseNickname = function(rawNickname, flag) {

	String.prototype.replaceAll = function (find, replace) {
    	
    	var str = this;
    	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
	};

	var sanitisedNickname = "";

	// replace special characters
	rawNickname = rawNickname.replaceAll("^a", "*").replaceAll("^c", ":").replaceAll("^d", "\\").replaceAll("^h", "#").replaceAll("^l", "<").replaceAll("^q", "?").replaceAll("^r", ">").replaceAll("^s", "/").replaceAll("^t", "\"").replaceAll("^v", "|").replaceAll("?", " ");

	var currentColour = "";
	var nextColour = "";
	var hasOpeningTag = false;

	for(var i = 0; i < rawNickname.length; i++) {

		if(flag != 0) {

			if(rawNickname[i] == "^") {

				if(hasOpeningTag == true) {
					sanitisedNickname += "</span>";
				}

				nextColour = rawNickname[i+1];

				switch(nextColour) {
					case "0":
						nextColour = '#000000';
						break;
					case "1":
						nextColour = '#FF0000';
						break;
					case "2":
						nextColour = '#00FF00';
						break;
					case "3":
						nextColour = '#FFFF00';
						break;
					case "4":
						nextColour = '#0000FF';
						break;
					case "5":
						nextColour = '#FF00FF';
						break;
					case "6":
						nextColour = '#00FFFF';
						break;
					case "7":
						nextColour = '#FFFFFF';
						break;
					case "8":
						nextColour = '#949494';
						break;
				}

				hasOpeningTag = true;
			}
		}

		if(currentColour != nextColour) {
			sanitisedNickname += "<span style='color: " + nextColour + ";'>";
			currentColour = nextColour;
		}

		sanitisedNickname += rawNickname[i];

		if((i == rawNickname.length-1) && (hasOpeningTag)) {
			sanitisedNickname += "</span>";
		}
	}
	sanitisedNickname = sanitisedNickname.replaceAll("^0", "").replaceAll("^1", "").replaceAll("^2", "").replaceAll("^3", "").replaceAll("^4", "").replaceAll("^5", "").replaceAll("^6", "").replaceAll("^7", "").replaceAll("^8", "")

	return sanitisedNickname;
}