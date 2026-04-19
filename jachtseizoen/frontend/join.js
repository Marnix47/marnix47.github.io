const params = new URLSearchParams(window.location.search);
if(params.has("gameId")){
    document.querySelector("#idInput").value = params.get("gameId");
}

document.querySelector("#joinButton").addEventListener("click", async (event) => {
    let name = document.querySelector("#nameInput").value;
    let id = document.querySelector("#idInput").value;
    try {
        let body = JSON.stringify({
            id:id,
            name:name
        })
        const response = await fetch(apiURL + "newplayer", {method: "POST", body: body});
        if(response.status != 200){
            alert("Er is iets misgegaan:\n" + await response.text());
            return;
        }
        StorageHandler.setGame(id, name, null, null);
        window.location.replace("/jachtseizoen/frontend/ready.html?gameId=" + id);

    } catch {
        alert("Er is iets misgegaan, probeer het opnieuw.");
    }


});