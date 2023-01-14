if(!localStorage.getItem("applestores")){
	//Als ie nog niet in de local storage zat, wordt ie nu aangemaakt:
	localStorage.setItem("applestores", 1)
} else {
	var t = parseInt(localStorage.getItem("applestores")) + 1
	//https://www.w3schools.com/jsref/jsref_parseint.asp
	localStorage.setItem("applestores", t)
}

//https://www.w3schools.com/jsrEF/prop_win_localstorage.asp

console.log(localStorage.getItem("applestores"))


window.onload = function() {
	searchClick();
	scrollEl();
	mobileMenu();
	loadAltText();
	
	var infoWindow = document.getElementById("infoWindow")
	var nameOfCity = document.getElementById("nameOfCity")
	var city = document.getElementById("city")
	var storeImage = document.getElementById("storeImage")
	var storeName = document.getElementById("storeName")
	var storeNames = ["Fifth Avenue", "Florida Mall", "Galleria Dallas", "The Grove", "Union Square", "Michigan Avenue", "SouthPark", "City Creek Center"]
	var cityIds = ["newyork", "orlando", "dallas", "losangeles", "sanfrancisco", "chicago", "charlotte", "saltlakecity"]
	var cityNames = ["New York", "Orlando", "Dallas", "Los Angeles", "San Francisco", "Chicago", "Charlotte", "Salt Lake City"]

	for (var i = 0; i < cityIds.length; i++) {
		//geïnspireerd op https://stackoverflow.com/questions/22799412/how-to-tell-if-an-element-of-a-list-was-clicked-in-javascript
		el = document.getElementById(cityIds[i])
		el.onmouseover = function(event) { renderInfoWindow(event.target) }
		el.onmouseleave = function() { hideInfoWindow() }
		el.onclick = function(event) { renderInfoField(event.target) }
	}

	function renderInfoWindow(cityName) {
		var Yposition = cityName.offsetTop - 50 + "px"
		var Xposition = cityName.offsetLeft - 30 + "px"
		infoWindow.style.top = Yposition
		infoWindow.style.left = Xposition
		//Ik weet dat de InfoWindow niet meeschuift als de vw verandert, maar dat maakt niet uit omdat je de vw niet kan aanpassen als je met je muis boven een element zit.
		infoWindow.style.display = "block"
		nameOfCity.innerHTML = cityNameHandler(cityName)
	}

	function hideInfoWindow() {
		infoWindow.style.display = "none"
	}

	function renderInfoField(cityName) {
		city.innerHTML = cityNameHandler(cityName)
		storeName.innerHTML = storeNameHandler(cityName)
		storeImage.src = imageHandler(cityName)
		storeImage.alt = cityNameHandler(cityName)
		storeImage.title = cityNameHandler(cityName)
		storeImage.style.display = "block"
	}

	function cityNameHandler(cityName) {
		return cityNames[cityIds.indexOf(cityName.id)]
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
	}

	function storeNameHandler(cityName) {
		return storeNames[cityIds.indexOf(cityName.id)]
	}

	function imageHandler(cityName) {
		return "afbeeldingen/apple-stores/" + cityName.id + ".jpeg"
	}
}