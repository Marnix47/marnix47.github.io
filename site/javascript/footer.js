var root = document.documentElement
window.onload = function(){
	//console.log(root)
	root.style.setProperty("--accent-colort", localStorage.getItem("accent"))
	//console.log(getComputedStyle(root).getPropertyValue("--accent-colort"))
}
