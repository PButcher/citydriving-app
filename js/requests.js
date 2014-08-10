var lfsUsernameRequest = function() {
	
	showLoader();

	$.support.cors = true;

	session.xhr = $.get(session.baseUrl + session.apiUrl, {type: "profile", username: session.settingLFSUsername}, function(data) {

		hideLoader();

		$('#welcome-lfs-message').show();

		if(data == "Unkown user") {
			$('#welcome-lfs-message').html("<i class='fa fa-times'></i> Invalid Username");
		} else {
			$('#welcome-lfs-message').html("<i class='fa fa-check'></i> Valid Username <a id='welcome-next' class='welcome-next' href='#'>Confirm</a>");
		}

		$('#welcome-next').click(function() {
			$('#menu').fadeIn(500);
			localStorage.lfsUsername = session.settingLFSUsername.toLowerCase();
			$('#welcome').hide();
			$('#server-statistics').show();
			homeRequest();
		});

	}).error(function(request, status, err) {
		if(status == "timeout") {
			noConnection();
			console.log("timeout");
		} else if(status == "abort") {
			console.log("ajax request aborted");
		}
	});
}

var homeRequest = function() {

	showLoader();

	$.support.cors = true;

	session.xhr = $.get(session.baseUrl + session.statsUrl, {format: "json"}, function(data) {

		$('#offline').hide();

		hideLoader();

		session.statsData = data;

		var playersServerOne = [];
		var playersServerTwo = [];

		$('#buddies-online-one').html("");
		$('#buddies-online-two').html("");

		var buddyCountOne = 0;
		var buddyCountTwo = 0;
		var buddiesOnlineOne = "";
		var buddiesOnlineTwo = "";

		for (var i = 0; i < data.length; i++) {

			var server;

			if (data[i].Server == "^7One") {
				server = "One";
				playersServerOne.push(data[i]);
				if (session.settingBuddyList[0]) {
					for (var j = 0; j < session.settingBuddyList.length; j++) {
						if (data[i].USERNAME.toLowerCase() == session.settingBuddyList[j].username.toLowerCase()) {
							buddyCountOne++;
							buddiesOnlineOne += "<a class='home-buddy' href='#'>" + session.settingBuddyList[j].username.toLowerCase() + "</a>";
						}
					}
				}
			} else {
				server = "Two";
				playersServerTwo.push(data[i]);
				if (session.settingBuddyList[0]) {
					for (var j = 0; j < session.settingBuddyList.length; j++) {
						if (data[i].USERNAME.toLowerCase() == session.settingBuddyList[j].username.toLowerCase()) {
							buddyCountTwo++;
							buddiesOnlineTwo += "<a class='home-buddy' href='#'>" + session.settingBuddyList[j].username.toLowerCase() + "</a>";
						}
					}
				}
			}
		}

		if (buddyCountOne != 0) {
			$('#buddies-online-one').append(buddiesOnlineOne);
			session.buddiesOnlineOne = buddiesOnlineOne;
		}
		if (buddyCountTwo != 0) {
			$('#buddies-online-two').append(buddiesOnlineTwo);
			session.buddiesOnlineTwo = buddiesOnlineTwo;
		}

		$('.home-buddy').click(function() {
			transition(session.view, 3);
			clearLookup();
			$('#username-field').val($(this).text());
			session.username = $(this).text();
			lookupRequest();
		});

		$('#players-online-one').html(playersServerOne.length);
		$('#players-online-two').html(playersServerTwo.length);

		$('#server-statistics h1').html("Hello <a id='change-lfs-username' class='change-lfs-username' href='#'>" + session.settingLFSUsername + "</a>");

		$('#change-lfs-username').click(function() {
			transition(session.view, 5);
		});

	}).error(function(request, status, err) {
		if(status == "timeout") {
			noConnection();
			console.log("timeout");
		} else if(status == "abort") {
			console.log("ajax request aborted");
		}
	});
}

var statsRequest = function(page) {

	// showLoader();

	$.support.cors = true;

	session.xhr = $.get(session.baseUrl + session.statsUrl, {type: page, format: 'json'}, function(data) {

		// hideLoader();
		
	}).error(function(request, status, err) {
		if(status == "timeout") {
			noConnection();
			console.log("timeout");
		} else if(status == "abort") {
			console.log("ajax request aborted");
		}
	});

}

var lookupRequest = function() {

	showLoader();

	$.support.cors = true;

	session.xhr = $.get(session.baseUrl + session.apiUrl, {type: "profile", username: session.username}, function(data) {

		hideLoader();

		$('#lookup').show();

		if (data != "Unkown user") {

			session.lookupData = data;

			var joinDate = new Date(data.date_joined*1000);
			var username = data.username;
			var country = data.country;
			var flag = data.flag;

			$('#username').text(username);
			$('#lookup-country img').attr('src', flag);
			$('#lookup-country img').show();
			$('#lookup-country span').html(" - " + country);
			$('#lookup-country').show();

			var days = ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "st"]
			var day = joinDate.getDate() + days[joinDate.getDate() -1];
			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var month = months[joinDate.getMonth()];
			var year = joinDate.getFullYear();
			var hour = pad(joinDate.getHours());
			var minute = pad(joinDate.getMinutes());

			$('#join-date').text("Joined " + day + " " + month + " " + year + " at " + hour + ":" + minute);
			$('#online-status').show();
			$('#online-status').attr("src", "http://insim.city-driving.co.uk/is_online.php?username=" + data.username);

			if (!session.settingBuddyList[0]) {
				$('#add-to-buddy-list').css("display", "inline-block");
				$('#remove-from-buddy-list').hide();
				$('#username').text(data.username);
			} else {
				for (var i = 0; i < session.settingBuddyList.length; i++) {
					$('#add-to-buddy-list').css("display", "inline-block");
					$('#remove-from-buddy-list').hide();
					$('#username').text(data.username);
					if (session.settingBuddyList[i].username.toLowerCase() == session.lookupData.username.toLowerCase()) {				
						$('#remove-from-buddy-list').css("display", "inline-block");
						$('#add-to-buddy-list').hide();
						$('#username').prepend("+");
						break;
					}
				}
			}
		}
	}).error(function(request, status, err) {
		if(status == "timeout") {
			noConnection();
			console.log("timeout");
		} else if(status == "abort") {
			console.log("ajax request aborted");
		}
	});
	
	$('#lookup-right').text("");

	if (session.settingBuddyList[0]) {

		if((session.buddiesOnlineOne != "") || (session.buddiesOnlineTwo != "")) {
			$('#lookup-right').append("<h1>Buddies Online</h1>");
			$('#lookup-right').append(session.buddiesOnlineOne);
			$('#lookup-right').append(session.buddiesOnlineTwo);
		}
		
		$('#lookup-right').append("<h1>All Buddies</h1>");

		for (var i = 0; i < session.settingBuddyList.length; i++) {
			var username = session.settingBuddyList[i].username;
			var nextString = "<a href='#' class='lookup-buddy'>" + username + "</a>" ;
			$('#lookup-right').append(nextString);
		}
	} else {
		$('#lookup-right').append("<p>You don't have any buddies yet</p>");
	}

	$('.lookup-buddy').click(function() {
		clearLookup();
		session.username = $(this).text().replace(" One", "").replace(" Two", "");
		$('#username-field').val(session.username);
		lookupRequest();
	});
	$('.home-buddy').click(function() {
		clearLookup();
		session.username = $(this).text().replace(" One", "").replace(" Two", "");
		$('#username-field').val(session.username);
		lookupRequest();
	});
}