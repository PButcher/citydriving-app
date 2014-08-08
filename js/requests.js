var homeRequest = function() {

	showLoader();

	$.support.cors = true;

	session.xhr = $.get(session.baseUrl + session.statsUrl, {format: "json"}, function(data) {

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
				if (session.settingBuddyList != "[]") {
					for (var j = 0; j < session.settingBuddyList.length; j++) {
						if (data[i].USERNAME.toLowerCase() == session.settingBuddyList[j].username.toLowerCase()) {
							buddyCountOne++;
							buddiesOnlineOne += "<a class='home-buddy' href='#'>" + session.settingBuddyList[j].username.toLowerCase() + "</a>" + " ";
						}
					}
				}
			} else {
				server = "Two";
				playersServerTwo.push(data[i]);
				if (session.settingBuddyList != "[]") {
					for (var j = 0; j < session.settingBuddyList.length; j++) {
						if (data[i].USERNAME.toLowerCase() == session.settingBuddyList[j].username.toLowerCase()) {
							buddyCountTwo++;
							buddiesOnlineTwo += "<a class='home-buddy' href='#'>" + session.settingBuddyList[j].username.toLowerCase() + "</a>" + " ";
						}
					}
				}
			}
		}

		if (buddyCountOne != 0) {
			$('#buddies-online-one').append(buddiesOnlineOne);
		}
		if (buddyCountTwo != 0) {
			$('#buddies-online-two').append(buddiesOnlineTwo);
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

	}).fail(function() {
		noConnection();
		console.log("failed");
	});
}

var statsRequest = function(page) {

	// showLoader();

	$.support.cors = true;

	session.xhr = $.get(session.baseUrl + session.statsUrl, {type: page, format: 'json'}, function(data) {

		// hideLoader();
		
	}).fail(function() {
		noConnection();
		console.log("failed");
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

			if (session.settingBuddyList.length == 0) {
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
	}).fail(function() {
		noConnection();
		console.log("failed");
	});;
}