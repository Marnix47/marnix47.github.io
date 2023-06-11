
function update(toMode) {
	localStorage.setItem("dark-mode", toMode)
}

window.onload = function() {
	var trueB = document.getElementById("true")
	var falseB = document.getElementById("false")
	var sysDefB = document.getElementById("system-default")

	trueB.onclick = function(event){
		update(event.target.id)
		window.parent.location.reload();
	}
	falseB.onclick = function(event){
		update(event.target.id)
		window.parent.location.reload()
	}
	sysDefB.onclick = function(event){
		update(event.target.id)
		window.parent.location.reload();
	}
}