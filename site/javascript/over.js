if (!localStorage.getItem("over")) {
	//Als ie nog niet in de local storage zat, wordt ie nu aangemaakt:
	localStorage.setItem("over", 1)
} else {
	var t = parseInt(localStorage.getItem("over")) + 1
	//https://www.w3schools.com/jsref/jsref_parseint.asp
	localStorage.setItem("over", t)
}

//https://www.w3schools.com/jsrEF/prop_win_localstorage.asp

console.log(localStorage.getItem("over"))


window.onload = function() {
	searchClick();
	mobileMenu();
	loadAltText();
	mFP = document.getElementById("mostFrequentPage")
	tP = document.getElementById("thisPage")
	mfpLink = document.getElementById("mfpLink")
	hitField = document.getElementById("hitField")
	previousRequests = document.getElementById("previousRequests")
	button = document.getElementById("returnButton")
	schemeButton = document.getElementById("colorSchemeButton")
	colorPicker = document.getElementById("colorPicker")
	accentPicker = document.getElementById("accentPicker")
	pageLinks = ["index", "geschiedenis", "osen", "applestores", "iphonetest"]
	pageNames = ["Home", "Geschiedenis", "OS\'en", "Apple Stores", "iPhone Test"]
	pageHits = [localStorage.getItem("index"), localStorage.getItem("geschiedenis"), localStorage.getItem("osen"), localStorage.getItem("applestores"), localStorage.getItem("iphonetest")]

	colorPicker.style.display = "none"
	accentPicker.style.display = "none"
	var currentHighestValue = 0
	for (var i = 0; i < pageLinks.length; i++) {
		if (parseInt(localStorage.getItem(pageLinks[i])) >= parseInt(currentHighestValue)) {
			currentHighestValue = localStorage.getItem(pageLinks[i])
			currentHighestName = pageNames[i]
			currentHighestHits = pageHits[i]
			currentHighestLink = pageLinks[i]
		}
	}
	mfpLink.innerHTML = currentHighestName
	//mfpLink.href = currentHighestLink + ".html" 
	mfpLink.href = `${currentHighestLink}.html`
	hitField.innerHTML = currentHighestHits
	previousRequests.innerHTML = parseInt(localStorage.getItem("over")) - 1

	button.onclick = function() {
		close()
	}
	schemeButton.onclick = function() {
		colorPicker.style.display = "block"
		accentPicker.style.display = "block"
	}
}