if (!localStorage.getItem("index")) {
	//Als ie nog niet in de local storage zat, wordt ie nu aangemaakt:
	localStorage.setItem("index", 1)
} else {
	var t = parseInt(localStorage.getItem("index")) + 1
	//https://www.w3schools.com/jsref/jsref_parseint.asp
	localStorage.setItem("index", t)
}

//https://www.w3schools.com/jsrEF/prop_win_localstorage.asp

console.log(localStorage.getItem("index"))

/*
var mode = localStorage.getItem("dark-mode")
var root = document.documentElement

function onChange(){
	if(mode == "true"){
		root.style.setProperty("--dark-mode-bg", "dimgrey")
		root.style.setProperty("--dark-mode-txt", "white")
	}
	if(mode == "false"){
		root.style.setProperty("--dark-mode-bg", "white")
		root.style.setProperty("--dark-mode-txt", "#6e6e73")
	}
}

onChange()
*/

var header;
var cross;
var clickState = false;
var smallScreen = false;
var first;
var second;

window.onload = function () {

	searchClick();
	scrollEl();
	mobileMenu();
	loadAltText();
	/*
	var header = document.getElementById("innerHeader")

	if (window.innerWidth <= 700) {
		collapse()
		smallScreen = true
	}

	cross = document.getElementById("cross")
	cross.onclick = function () {
		if (!clickState) {
			turnCross()
			decollapse()
		} else {
			turnLine()
			collapse()
		}
	  clickState = !clickState
	}
	*/
}
/*
function turnCross() {
	cross.childNodes[1].classList.add("AnimationOpen");
	cross.childNodes[3].classList.add("AnimationOpen")
	// https://stackoverflow.com/questions/195951/how-can-i-change-an-elements-class-with-javascript
}

function turnLine() {
	cross.childNodes[1].classList.remove("AnimationOpen")
	cross.childNodes[3].classList.remove("AnimationOpen")
}

function decollapse() {
	var navBar = document.getElementById("navBar")
	navBar.style.display = "block"
	header.style.height = parseInt(parseInt(navBar.offsetHeight) + 51) + "px"
}

function collapse() {
	var navBar = document.getElementById("navBar")
	navBar.style.display = "none"
	header.style.height = "51px"
}

window.onresize = (event) => {
	if (window.innerWidth <= 700){
		if(clickState){
			navBar.style.display = "block"
		} else {
			navBar.style.display = "none"
		}
	} else {
		navBar.style.display = "block"
	}		
}
*/
