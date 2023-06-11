window.onload = function(){
	const picker = document.getElementById("colorPicker")
	//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color
	picker.addEventListener("change", changeAccent, false);
	picker.addEventListener("change", parent.changeAccent, false)

}