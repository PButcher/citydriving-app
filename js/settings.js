var getSettings = function() {
	
	// Get buddy list
	if(localStorage.buddyList) {
		if(localStorage.buddyList.length != 0) {
			session.settingBuddyList = JSON.parse(localStorage.buddyList);
		}
	} else {
		localStorage.buddyList = session.settingBuddyList;
	}

	// Get refresh rate
	if(localStorage.refreshRate) {
		session.settingRefreshRate = localStorage.refreshRate;
	} else {
		localStorage.refreshRate = session.settingRefreshRate;
	}
}

var setSettings = function() {

	localStorage.buddyList = JSON.stringify(session.settingBuddyList);
	localStorage.refreshRate = session.settingRefreshRate;
}