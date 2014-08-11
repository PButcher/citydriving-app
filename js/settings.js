var getSettings = function() {
	
	// Load the launch screen?
	if(localStorage.launchScreen) {
		session.settingLaunchScreen = localStorage.launchScreen;
		if(session.settingLaunchScreen == "true") {
			$('#setting-launch i').attr('class', 'fa fa-check-square');
		} else {
			$('#setting-launch i').attr('class', 'fa fa-square');
		}
	}

	// Get LFS Username
	if(localStorage.lfsUsername) {
		session.settingLFSUsername = localStorage.lfsUsername;
		$('#setting-name-lfs-username').text(session.settingLFSUsername);
	}

	// Get buddy list
	if(localStorage.buddyList) {
		if(localStorage.buddyList != "[]") {
			session.settingBuddyList = JSON.parse(localStorage.buddyList);
			$('#setting-buddy-list-setting').show();
		} else {
			$('#setting-buddy-list-setting').hide();
		}
	} else {
		localStorage.buddyList = session.settingBuddyList;
		$('#setting-buddy-list-setting').hide();
	}

	// Get refresh rate
	if(localStorage.refreshRate) {
		session.settingRefreshRate = localStorage.refreshRate;
		if(session.settingRefreshRate == 15000) {
			$('#setting-refresh i').attr('class', 'fa fa-check-square');
		} else {
			$('#setting-refresh i').attr('class', 'fa fa-square');
		}
	} else {
		localStorage.refreshRate = session.settingRefreshRate;
	}
}

var setSettings = function() {

	localStorage.launchScreen = session.settingLaunchScreen;
	localStorage.lfsUsername = session.settingLFSUsername;
	localStorage.buddyList = JSON.stringify(session.settingBuddyList);
	localStorage.refreshRate = session.settingRefreshRate;
}