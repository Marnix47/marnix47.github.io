if(!localStorage.getItem("osen")){
	//Als ie nog niet in de local storage zat, wordt ie nu aangemaakt:
	localStorage.setItem("osen", 1)
} else {
	var t = parseInt(localStorage.getItem("osen")) + 1
	//https://www.w3schools.com/jsref/jsref_parseint.asp
	localStorage.setItem("osen", t)
}

//https://www.w3schools.com/jsrEF/prop_win_localstorage.asp

console.log(localStorage.getItem("osen"))


window.onload = function() {
	searchClick();
	scrollEl();
	mobileMenu();
	loadAltText();
	
	//window.onload: https://stackoverflow.com/questions/1829925/javascript-getelementbyid-not-working

	var headerColor = getComputedStyle(document.documentElement).getPropertyValue('--header-color');
	var accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
	console.log(headerColor + " " + accentColor)
	//https://davidwalsh.name/css-variables-javascript
	//zodat ik alleen in de css de accent-color en header-color hoef aan te passen

	var macosH = document.getElementById("macos").offsetTop;
	var iosH = document.getElementById("ios").offsetTop;
	var ipadosH = document.getElementById("ipados").offsetTop;
	var watchosH = document.getElementById("watchos").offsetTop;
	var footerH = document.getElementById("footer").offsetTop;
	//getElementById & offsetTop: https://www.w3schools.com/jsref/prop_element_offsettop.asp

	function sideBarUpdater(topEl, bottomEl, elName){
		let conditionalVH = window.innerHeight * 0.2;
		//https://gomakethings.com/how-to-get-the-width-and-height-of-the-viewport-with-vanilla-js/
		if (scrollY >= (topEl - conditionalVH) && scrollY < (bottomEl - conditionalVH)) {
			document.getElementById(elName).style.backgroundColor = accentColor;
		} else {
			document.getElementById(elName).style.backgroundColor = headerColor;
		}
	}

	setInterval(() => {
		sideBarUpdater(macosH, iosH, "macosBar");
		sideBarUpdater(iosH, ipadosH, "iosBar");
		sideBarUpdater(ipadosH, watchosH, "ipadosBar");
		sideBarUpdater(watchosH, footerH, "watchosBar");
	}, 50)

};