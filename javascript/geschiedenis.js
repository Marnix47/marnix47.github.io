if(!localStorage.getItem("geschiedenis")){
	//Als ie nog niet in de local storage zat, wordt ie nu aangemaakt:
	localStorage.setItem("geschiedenis", 1)
} else {
	var t = parseInt(localStorage.getItem("geschiedenis")) + 1
	//https://www.w3schools.com/jsref/jsref_parseint.asp
	localStorage.setItem("geschiedenis", t)
}

//https://www.w3schools.com/jsrEF/prop_win_localstorage.asp

console.log(localStorage.getItem("geschiedenis"))

window.onload = function(){
	searchClick();
	scrollEl();
	mobileMenu();
	loadAltText();
}