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
			session.settingLFSUsername = $('#welcome-username').val().toLowerCase();
			setSettings();
			$('#welcome').hide();
			$('#server-statistics').show();
			homeRequest();
		});

	}).error(function(request, status, err) {
		if(status == "timeout" || status == "error") {
			noConnection();
			console.log("offline");
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
		} else {
			session.buddiesOnlineOne = "";
		}
		if (buddyCountTwo != 0) {
			$('#buddies-online-two').append(buddiesOnlineTwo);
			session.buddiesOnlineTwo = buddiesOnlineTwo;
		} else {
			session.buddiesOnlineTwo = "";
		}

		$('.home-buddy').click(function() {
			clearLookup();
			$('#username-field').val($(this).text());
			session.username = $(this).text();
			lookupRequest();
			transition(session.view, 2);
		});

		$('#players-online-one').html(playersServerOne.length);
		$('#players-online-two').html(playersServerTwo.length);

		$('#server-statistics h1').html("Hello <a id='change-lfs-username' class='change-lfs-username' href='#'>" + session.settingLFSUsername + "</a>");

		$('#change-lfs-username').click(function() {
			transition(session.view, 5);
		});

	}).done(function() {
		if(session.view == "lookup") {
			lookupRequest();
		}
	}).error(function(request, status, err) {
		if(status == "timeout" || status == "error") {
			noConnection();
			console.log("offline");
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
		if(status == "timeout" || status == "error") {
			noConnection();
			console.log("offline");
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

			var now = new Date();
			var joinDate = new Date(data.date_joined*1000);
			var lastSeen = new Date(data.date_last_seen*1000);
			var username = data.username;
			var nickname = data.last_seen_nickname;
			var country = data.country;
			var flag = data.flag;

			$('#online-status').show();
			$('#online-status').attr("src", "http://insim.city-driving.co.uk/is_online.php?username=" + data.username);

			// Admin?
			if((session.lookupData.admin_level == "1") || (session.lookupData.admin_level == "2") || (session.lookupData.admin_level == "3") || (session.lookupData.admin_level == "4")) {
				$('#lookup-admin').show();
			} else {
				$('#lookup-admin').hide();
			}

			$('#username').text(username);
			$('#lookup-nickname').html(sanitiseNickname(nickname));

			$('#lookup-table').show();
			
			if(country) {
				$('#lookup-country img').attr('src', flag);
				$('#lookup-country img').show();
				$('#lookup-country span').html(" <span style='color: #666;'>- " + country + "</span>");
				$('#lookup-country').show();
			} else {
				$('#lookup-country img').hide();
				$('#lookup-country span').html("<span style='color: #666;'>Unknown</span>");
			}

			// Last Seen
			var days = ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "st"]
			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var day = lastSeen.getDate() + days[lastSeen.getDate() -1];
			var month = months[lastSeen.getMonth()];
			var year = lastSeen.getFullYear();
			var hour = pad(lastSeen.getHours());
			var minute = pad(lastSeen.getMinutes());

			var nowPlusOne = (now.getDate() + days[now.getDate() -1]) + " " + months[now.getMonth()] + " " + now.getFullYear() + " <span style='color: #666;'>at " + pad(now.getHours()) + ":" + pad(now.getMinutes() + 1) + "</span>";
			var nowMinusOne = (now.getDate() + days[now.getDate() -1]) + " " + months[now.getMonth()] + " " + now.getFullYear() + " <span style='color: #666;'>at " + pad(now.getHours()) + ":" + pad(now.getMinutes() - 1) + "</span>";
			now = (now.getDate() + days[now.getDate() -1]) + " " + months[now.getMonth()] + " " + now.getFullYear() + " <span style='color: #666;'>at " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + "</span>";
			lastSeen = day + " " + month + " " + year + " <span style='color: #666;'>at " + hour + ":" + minute + "</span>";
			if ((now == lastSeen) || (nowMinusOne == lastSeen) || (nowPlusOne == lastSeen)) {
				$('#last-seen').html("<span style='color: #00FF00;'>Online</span> <span style='color: #666;'>(Server " + sanitiseNickname(data.last_seen_server, 0) + ")</span>");
			} else {
				$('#last-seen').html(lastSeen);
			}

			// Join Date
			day = joinDate.getDate() + days[joinDate.getDate() -1];
			month = months[joinDate.getMonth()];
			year = joinDate.getFullYear();
			hour = pad(joinDate.getHours());
			minute = pad(joinDate.getMinutes());

			$('#join-date').html(day + " " + month + " " + year + " <span style='color: #666;'>at " + hour + ":" + minute + "</span>");

			// Money
			$('#lookup-money').html("€ " + numberWithCommas(data.money) + " <span style='color: #666;'>- Wealth: € " + numberWithCommas(data.stats.net_value) + "</span>");

			// Driven Distance
			var distance = data.stats.driven_distance / 1000;
			var distanceMl = distance*0.6;
			distance = numberWithCommas(distance.toFixed(0));
			distanceMl = numberWithCommas(distanceMl.toFixed(0));
			$('#lookup-distance').html(distance + " km <span style='color: #666;'>- " + (distanceMl) + " miles</span>");

			// Driving Time
			var drivingTimeCop = parseInt(data.stats.playing_time_cop / 3600);
			var drivingTimeRobber = parseInt(data.stats.playing_time_robber / 3600);
			var drivingTime = drivingTimeCop + drivingTimeRobber;
			drivingTime = numberWithCommas(drivingTime.toFixed(0));
			drivingTimeCop = numberWithCommas(drivingTimeCop.toFixed(0));
			drivingTimeRobber = numberWithCommas(drivingTimeRobber.toFixed(0));
			$('#lookup-time').html(drivingTime + " hours <span style='color: #666;'>- Cop: " + drivingTimeCop + " - Civ: " + drivingTimeRobber + "</span>");

			// Cop Success
			var copWin = parseInt(data.stats.chases_won_cop);
			var copLoss = parseInt(data.stats.chases_lost_cop);
			var copAvgXP = parseInt(data.stats.cop_xp) / (copWin + copLoss);
			if(copWin != 0 && copLoss != 0) {
				$('#lookup-copwl').show();
				var copSuccess = (copWin / (copWin + copLoss)) * 100;
				var winPercentage = pad(copSuccess.toFixed(0));
				$('#lookup-copwl .lookup-graph-success').text("Success: " + winPercentage + "%");
				$('#lookup-copwl .lookup-graph-xp').text(copAvgXP.toFixed(1) + "XP AVG (" + numberWithCommas(data.stats.cop_xp) + ")");
				$('#lookup-copwl .line-positive-label').text("Won: " + copWin);
				$('#lookup-copwl .line-negative-label').text("Lost: " + copLoss);
				var lineLength = winPercentage * 2.8;
				$('#lookup-copwl .line-positive').animate({width: lineLength},500);
			} else {
				$('#lookup-copwl').hide();
			}

			// Robber Success
			var robWin = parseInt(data.stats.chases_won_robber);
			var robLoss = parseInt(data.stats.chases_lost_robber);
			var robAvgXP = parseInt(data.stats.robber_xp) / (robWin + robLoss);
			if(robWin != 0 && robLoss != 0) {
				$('#lookup-robwl').show();
				var robSuccess = (robWin / (robWin + robLoss)) * 100;
				var winPercentage = pad(robSuccess.toFixed(0));
				$('#lookup-robwl .lookup-graph-success').text("Success: " + winPercentage + "%");
				$('#lookup-robwl .lookup-graph-xp').text(robAvgXP.toFixed(1) + "XP AVG (" + numberWithCommas(data.stats.robber_xp) + ")");
				$('#lookup-robwl .line-positive-label').text("Won: " + robWin);
				$('#lookup-robwl .line-negative-label').text("Lost: " + robLoss);
				var lineLength = winPercentage * 2.8;
				$('#lookup-robwl .line-positive').animate({width: lineLength},500);
			} else {
				$('#lookup-robwl').hide();
			}

			// Buddy
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
						$('#username').css("color", "#00ABD6");
						break;
					} else {
						$('#username').css("color", "#FFF");
					}
				}
			}
		}
	}).error(function(request, status, err) {
		if(status == "timeout" || status == "error") {
			noConnection();
			console.log("offline");
		} else if(status == "abort") {
			console.log("ajax request aborted");
		}
	});
}

var buddiesRequest = function() {

	$('#buddies').show();

	$('#buddy-list').text("");

	if (session.settingBuddyList[0]) {

		for (var i = 0; i < session.settingBuddyList.length; i++) {
			var username = session.settingBuddyList[i].username;
			var nextString = "<a href='#' class='lookup-buddy'>" + username + "</a>" ;
			$('#buddy-list').append(nextString);
		}
	} else {
		$('#buddy-list').append("<p>You don't have any buddies yet</p>");
	}

	$('.lookup-buddy').click(function() {
		clearLookup();
		session.username = $(this).text();
		$('#username-field').val(session.username);
		lookupRequest();
		transition(session.view, 2);
	});
}