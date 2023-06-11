if(!localStorage.getItem("iphonetest")){
	//Als ie nog niet in de local storage zat, wordt ie nu aangemaakt:
	localStorage.setItem("iphonetest", 1)
} else {
	var t = parseInt(localStorage.getItem("iphonetest")) + 1
	//https://www.w3schools.com/jsref/jsref_parseint.asp
	localStorage.setItem("iphonetest", t)
}

//https://www.w3schools.com/jsrEF/prop_win_localstorage.asp

console.log(localStorage.getItem("iphonetest"))


window.onload = function() {
	searchClick();
	mobileMenu();
	loadAltText();
	mobileMenu();
	
	var ise = 0;
	var i12 = 0;
	var i13 = 0;
	var i14 = 0;
	var pro = 0;
	var bigSize = 0;

	var startButton = document.getElementById("startButton");
	var welcomeScreen = document.getElementById("welcomeScreen");
	var questionScreen = document.getElementById("questionScreen");
	var resultScreen = document.getElementById("resultScreen");
	var resultLine = document.getElementById("resultLine");
	var question = document.getElementById("question");
	var button1 = document.getElementById("button1");
	var button2 = document.getElementById("button2");
	var button3 = document.getElementById("button3");
	console.log(button3);
	var currentQuestion = 0;
	let q = ["Waarvoor wil je je telefoon gebruiken?", "Hoe groot moet het scherm zijn?", "Hoeveel mag het kosten?", "Moet je het nieuwste van het nieuwste hebben?"];
	let a1 = ["Alleen een beetje appen", "Klein (4.7″ - 5.4″)", "Rond de €600", "Met oude modellen kan ik prima leven"];
	let a2 = ["Voor het kijken vanTikTok", "Gemiddeld (6.1″)", "Rond de €800", "Ik hoef niet het laatste model, maar een beetje recent is wel wenselijk"];
	let a3 = ["Om te filmen in hoge kwaliteit en dat soort pro dingen", "Zo groot als het maar kan (6.7″)", "Meer dan 1000€", "Het is voor mijn zelfvertrouwen heel belangrijk om de nieuwste tech te hebben"];




	//schermgrootte, batterijduur, prijs

	startButton.onclick = function() {
		welcomeScreen.style.display = "none";
		questionScreen.style.display = "block";
		questionRender(false);
	};

	button1.onclick = function(event) {
		buttonClick(event.target);
		questionRender(true);
	};

	button2.onclick = function(event) {
		buttonClick(event.target);
		questionRender(true);
	};

	button3.onclick = function(event) {
		buttonClick(event.target);
		questionRender(true);
	};



	function buttonClick(cAns) {
		if (currentQuestion == 0) {
			if (cAns == button1) {
				ise += 1;
				i12 -= 1;
				i13 -= 1;
				i14 -= 2;
				pro -= 3;
				bigSize -= 1;
			}
			if (cAns == button2) {
				i12 += 1;
				i13 += 1;
				i14 += 1;
			}
			if (cAns == button3) {
				i14 += 1;
				pro += 1;
				bigSize += 1;
				ise -= 1;
			}
		}
		if (currentQuestion == 1) {
			if (cAns == button1) {
				bigSize -= 3;
				ise += 1;
				i12 -= 1;
				i13 += 1;
				i14 -= 1;
			}
			if (cAns == button2) {
				ise -= 1;
				i12 += 1;
				i13 += 1;
				i14 += 1;
			}
			if (cAns == button3) {
				bigSize += 1;
				ise -= 3;
				i12 -= 1;
			}
		}
		if (currentQuestion == 2) {
			if (cAns == button1) {
				ise += 3;
				i12 -= 2;
				i13 -= 3;
				i14 -= 4;
				pro -= 2;
				bigSize -= 2;
			}
			if (cAns == button2) {
				ise += 2;
				i12 += 2;
				i13 += 1;
				i14 -= 3;
				pro -= 2;
			}
			if (cAns == button3) {
				i12 += 1;
				i13 += 3;
				i14 += 2;
				pro += 2;
				bigSize += 2;
			}
		}
		if (currentQuestion == 3) {
			if (cAns == button1) {
				i12 += 1;
				ise += 1;
				i13 -= 1;
				i14 -= 1;
			}
			if (cAns == button2) {
				i12 -= 1;
				i13 += 1;
			}
			if (cAns == button3) {
				i12 -= 2;
				i13 -= 1;
				ise -= 1;
				i14 += 2;
			}
		}
	}

	function questionRender(countUp) {
		if (currentQuestion < 3) {
			if (countUp) {
				currentQuestion += 1;
			}
			console.log("currentQuestion is " + currentQuestion)
			question.innerText = q[currentQuestion];
			button1.innerText = a1[currentQuestion];
			button2.innerText = a2[currentQuestion];
			button3.innerText = a3[currentQuestion];
		} else {
			resultHandler();
			questionScreen.style.display = "none";
			resultScreen.style.display = "block";
		}
	};

	function resultHandler() {
		var highestPhone = ise; var highestPhoneName = "ise";
		if (i12 == highestPhone) { highestPhone = i12; highestPhoneName = [highestPhoneName, "i12"] }
		if (i12 > highestPhone) { highestPhone = i12; highestPhoneName = "i12" }
		if (i13 == highestPhone) { highestPhone = i13; highestPhoneName = [highestPhoneName, "i13"] }
		if (i13 > highestPhone) { highestPhone = i13; highestPhoneName = "i13" }
		if (i14 == highestPhone) { highestPhone = i14; highestPhoneName = [highestPhoneName, "i14"] }
		if (i14 > highestPhone) { highestPhone = i14; highestPhoneName = "i14" }
		console.log(highestPhoneName)


		let maxName = false;
		let proName = false;
		let miniName = false;
		if (pro >= 3) {
			if (highestPhoneName == "i14" || highestPhoneName == "i13" || highestPhoneName[highestPhoneName.length - 1] == "i14" || highestPhoneName[highestPhoneName.length - 1] == "i13") {
				proName = true
			}
		}
		console.log(proName);
		if (bigSize >= 2) {
			if (highestPhoneName == "i14" || (highestPhoneName == "i13" && proName == true) || highestPhoneName[highestPhoneName.length - 1] == "i14" || (highestPhoneName[highestPhoneName.length - 1] == "i13" && proName == true)) {
				maxName = true
			}
		}
		console.log(maxName)
		if (bigSize <= -2) {
			if (highestPhoneName == "i13" || highestPhoneName[highestPhoneName.length - 1] == "i13") {
				miniName = true
			}
		}
		console.log(miniName)


		if (typeof highestPhoneName === "object") {
			phoneResult = highestPhoneName[highestPhoneName.length - 1]
		} else {
			phoneResult = highestPhoneName
		}
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof

		phoneName = ""
		if (phoneResult == "ise") { phoneName = "iPhone SE" }
		if (phoneResult == "i12") { phoneName = "iPhone 12" }
		if (phoneResult == "i13") { phoneName = "iPhone 13" }
		if (phoneResult == "i14") { phoneName = "iPhone 14" }
		console.log(phoneName)
		if (proName) { phoneName += " Pro" }
		if (maxName) { 
			if(phoneResult == "i14"){
				phoneName += " Plus"
			} else {
				phoneName += " Max" 
			}
		}
		if (miniName) { phoneName += " Mini"}
		console.log(phoneName)
		resultLine.innerText = phoneName
	}
};
