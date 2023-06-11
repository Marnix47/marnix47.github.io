var metaTags = document.getElementsByTagName("meta")
for (var i = 0; i < metaTags.length; i++) {
	if (metaTags[i].name == "theme-color") {
		var headerMeta = i
	}
}



var root = document.documentElement

if(localStorage.getItem("accent") == "undefined"){
	localStorage.setItem("accent", "#FF6347")
	console.log("changed")
	loadAccent()
} else {
	console.log(localStorage.getItem("accent"))
}
loadAccent()

function loadAccent(){
	root.style.setProperty("--accent-color", localStorage.getItem("accent"))
}

function changeAccent(event){
	root.style.setProperty("--accent-color", event.target.value)
	localStorage.setItem("accent", event.target.value)
}

function updateColorScheme(systemMode, selectedMode) {
	//console.log(systemMode)
	//console.log(selectedMode)
	if (selectedMode == "system-default") {
		if (systemMode) {
			turnDark()
		}
		if (!systemMode) {
			turnLight()
		}
	} else {
		if (selectedMode == "true") {
			turnDark()
		}
		if (selectedMode == "false") {
			turnLight()
		}
	}
}

function turnLight() {
	root.style.setProperty("--dark-mode-bg", "white")
	root.style.setProperty("--dark-mode-txt", "#6e6e73")
	root.style.setProperty("--dark-mode-img", "invert(.7)")
	//metaTags[headerMeta].content = "white"
}

function turnDark() {
	root.style.setProperty("--dark-mode-bg", "dimgrey")
	root.style.setProperty("--dark-mode-txt", "white")
	root.style.setProperty("--dark-mode-img", "invert(.8)")
	//metaTags[headerMeta].content = "dimgrey"
}

updateColorScheme(getSysDef(), getSettings())

window.matchMedia("(prefers-color-scheme: dark)").addListener(() => onChange())

function onChange() {
	updateColorScheme(getSysDef(), getSettings())
	console.log("changed")
}

function getSysDef() {
	return window.matchMedia("(prefers-color-scheme:dark)").matches
}

function getSettings() {
	if (localStorage.getItem("dark-mode") === null) {
		return "system-default"
	} else {
		return localStorage.getItem("dark-mode")
	}
}

function scrollEl() {
	urlParams = new URLSearchParams(window.location.search);
	tag = urlParams.get("tag")
	index = urlParams.get("tagIndex")
	if (tag) {
		el = document.getElementsByTagName(tag)[index]
		console.log(el)
		height = el.offsetHeight
		scrollTo(0, getOffset(el).top - 500)
	}
}

function getSearch() {
	input = document.getElementById("searchField")

	if (input.value != "") {
		console.log(input.value)
		window.location.href = `search.html?s=${input.value}`
	} else {
		console.log(input.value)
		alert("Wel iets invullen, wil je?")
	}

}

function getOffset(el) {
	const rect = el.getBoundingClientRect();
	return {
		left: rect.left + window.scrollX,
		top: rect.top + window.scrollY
	};
}

function searchClick() {
	var vergrootglas = document.getElementById("vergrootglas")
	if (vergrootglas) {
		document.getElementById("vergrootglas").addEventListener("click", function() {
			getSearch()
		})
	}
	document.getElementById("searchField").addEventListener("keypress", function(event){
		if(event.key === "Enter"){
			if(document.activeElement === document.getElementById("searchField")){
				getSearch();
			}
		}
	})
}

var clickState = false;

function mobileMenu(){
	var smallScreen = false;
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
}

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
	var header = document.getElementById("innerHeader")
	var navBar = document.getElementById("navBar")
	navBar.style.display = "block"
	header.style.height = parseInt(parseInt(navBar.offsetHeight) + 51) + "px"
}

function collapse() {
	var header = document.getElementById("innerHeader")
	var navBar = document.getElementById("navBar")
	navBar.style.display = "none"
	header.style.height = "51px"
}


function loadAltText(){
	var imgs = document.getElementsByTagName("img")
	//console.log(imgs)
	for(el of imgs){
		if(el.alt){
			el.title = el.alt
		} else {
			console.warn(el)
			console.warn("has no alt yet")
		}
	}
}


window.onresize = (event) => {
	if (window.innerWidth <= 700){
		if(clickState){
			navBar.style.display = "block"
			document.getElementById("innerHeader").style.height = parseInt(parseInt(navBar.offsetHeight) + 51) + "px"
		} else {
			navBar.style.display = "none"
		}
	} else {
		navBar.style.display = "block"
		document.getElementById("innerHeader").style.height = "51px"
	}		
}