
var pages = ["index.html", "geschiedenis.html", "osen.html", "applestores.html", "iphonetest.html"]
var pageNames = ["index", "geschiedenis", "osen", "applestores", "iphonetest"]
var pageTitles = ["Home", "Geschiedenis", "Os'en", "Apple Stores", "iPhone Test"]
var tags = ["h1", "h2", "h3", "p", "em"];

window.onload = function() {
	question = new URLSearchParams(window.location.search).get('s')
	if(question == "" || question == " "){
		alert("Wil je je computer laten crashen ofzo?")
	} else {
		createObject()
	}
	searchClick();
	mobileMenu();
	loadAltText();
	document.title = `Zoeken: ${question} \| Not A Cherry`;
}

function createObject() {

	var elementObject = {}
	for (var h = 0; h < pageNames.length; h++) {
		elementObject[pageNames[h]] = {}
		for (var i = 0; i < tags.length; i++) {
			elementObject[pageNames[h]][tags[i]] = []
		}
	}
	console.log(elementObject)

	createIframes()


	document.getElementsByTagName("iframe")[4].addEventListener("load", function() {

		var iI = document.getElementsByTagName("iframe")

		for (var k = 0; k < iI.length; k++) {
			currentIframe = iI[k].contentWindow.document

			for (var i = 0; i < tags.length; i++) {
				var result = currentIframe.getElementsByTagName(tags[i])
				for (var h = 0; h < result.length; h++) {
					try {
						var currentEl = result[h].innerHTML
						currentEl = currentEl.replace(/\t/gm, '')
						currentEl = currentEl.replace(/\n/gm, ' ')
						//Alle tabs en line-breaks (die zorgen voor de inspringen) staan er anders als \n\t\t\t\t
						elementObject[pageNames[k]][tags[i]][h] = currentEl
					} catch (error) {
						console.warn(error)
						console.warn(`k is ${k}, i is ${i}, h is ${h}`)
					}
					//console.log(elementObject[pages[k]][tags[i]])
					//console.log(elementObject[pages[k]][tags[i]][h])
				}
			}
		}
		console.log(elementObject)
		console.log(performance.now())
		document.getElementById("loaderBody").style.opacity = 0
		setTimeout(function() {
			document.getElementById("loaderBody").style.display = "none"

		}, 1000)
		results = searchObject(elementObject)
		handleObject(results)

	});
}

function searchObject(obj) {
	urlParams = new URLSearchParams(window.location.search);
	question = urlParams.get('s')
	results = []
	for (var i = 0; i < Object.keys(obj).length; i++) {

		for (var h = 0; h < tags.length; h++) {

			currentArray = obj[pageNames[i]][tags[h]]

			for (var k = 0; k < currentArray.length; k++) {

				if (currentArray[k].toLowerCase().includes(question.toLowerCase())) {
					results.push({ pageIndex: i, pageUrl: pages[i], tag: tags[h], tagIndex: k, content: currentArray[k] })
				}

			}
		}
	}
	return results;
}

function handleObject(results) {
	if(results.length == 0){
		showEmptyMessage()
	}
	urlParams = new URLSearchParams(window.location.search);
	question = urlParams.get("s")
	document.getElementById("searchedField").innerHTML = question
	for (var x = 0; x < results.length; x++) {
		content = checkOccur(x, results)
		createElement(results[x].pageIndex, content, results[x].tag, results[x].tagIndex)
	}
}

function createElement(pageIndex, content, tag, tagIndex) {
	document.getElementById("resultsOutput").innerHTML += `<div class="searchResult"><h2 class="resultPageName"><a href='${pages[pageIndex]}?tag=${tag}&tagIndex=${tagIndex}'>${pageTitles[pageIndex]}</a></h2><p class="resultContent">${content}</p></div>`
}

function checkOccur(i, results,) {
	urlParams = new URLSearchParams(window.location.search);
	question = urlParams.get("s").toLowerCase()
	var text = results[i].content;
	qIndex = 0
	stop = false;
	var indexes = []
	while (!stop) {

		var openTag = 0
		var closeTag = 0
		var cIndex = text.toLowerCase().indexOf(question, qIndex)

		if (cIndex != -1) {

			for (var i = 0; i < cIndex; i++) {
				if (text[i] == "<") {
					openTag++
				}
				if (text[i] == ">") {
					closeTag++
				}
			}

			if (closeTag === openTag) {
				indexes.push(cIndex)
			} else {
				console.log("not pushed")
			}

			qIndex = text.toLowerCase().indexOf(question, qIndex) + question.length
		} else {
			stop = true
			var modifiedContent = markOccur(text, indexes)
		}
	}
	//console.log(modifiedContent)
	return modifiedContent;
}

function markOccur(text, indexes) {
	urlParams = new URLSearchParams(window.location.search);
	question = urlParams.get("s").toLowerCase()
	var toEdit = text
	var start = 0
	var newOutput = toEdit.substring(start, indexes[0])

	for (var a = 0; a < indexes.length; a++) {
		newOutput += `<span class="highlightResult">` + toEdit.substring(indexes[a], question.length + indexes[a]) + `</span>` + toEdit.substring(indexes[a] + question.length, indexes[a + 1])
	}
	return newOutput
}

function createIframes() {
	var body = document.getElementsByTagName("body")[0]
	for (var h = 0; h < pages.length; h++) {
		body.innerHTML += `<iframe id='${h}' src='${pages[h]}' style='display:none;'></iframe>`
	}
}

function showEmptyMessage(){
	document.getElementById("emptySearch").style.display = "block"
}