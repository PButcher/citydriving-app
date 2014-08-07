var getSettings = function() {
	
	if(localStorage.buddyList) {
		if(localStorage.buddyList.length != 0) {
			session.settingBuddyList = JSON.parse(localStorage.buddyList);
		}
	} else {
		localStorage.buddyList = session.settingBuddyList;
	}
}

var setSettings = function() {

	localStorage.buddyList = JSON.stringify(session.settingBuddyList);
}