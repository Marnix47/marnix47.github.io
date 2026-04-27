const durationSlider = document.querySelector("#durationSlider");
const intervalSlider = document.querySelector("#intervalSlider");
const uitloopTijdSlider = document.querySelector("#uitloopTijdSlider");
const verhoogdIntervalCheckbox = document.querySelector("#verhoogdIntervalCheckbox");
const intervalAfterxMinutesSlider = document.querySelector("#intervalAfterxMinutesSlider")
const laatsteIntervalSlider = document.querySelector("#laatsteIntervalSlider")
const playerNameInput = document.querySelector("#playerName");
const secondaryCircleTimeSlider = document.querySelector("#secondaryCircleTimeSlider");




const firstPhaseInputs = [
    document.querySelector("#durationSlider"),
    document.querySelector("#intervalSlider")
]

const secondPhaseInputs = [
    document.querySelector("#verhoogdIntervalCheckbox"),
    document.querySelector("#intervalAfterxMinutesSlider"),
    document.querySelector("#laatsteIntervalSlider"),
    document.querySelector("#playerName")
]

const thirdPhaseInputs = [
    document.querySelector("#ringSelectionWrapper")
]
document.querySelector("#durationSlider").addEventListener("input", (event) => {
    document.querySelector("#durationText").innerHTML = event.target.value;
    document.querySelector("#intervalAfterxMinutesSlider").max = event.target.value;
    document.querySelector("#secondaryCircleTimeSlider").max = event.target.value;

});

document.querySelector("#intervalSlider").addEventListener("input", (event) => {
    document.querySelector("#intervalText").innerHTML = event.target.value/60;
    document.querySelector("#laatsteIntervalSlider").max = event.target.value;
});

uitloopTijdSlider.addEventListener("input", (event) => {
    console.log(event.target.value);
    document.querySelector("#uitloopText").innerHTML = event.target.value;
})

document.querySelector("#verhoogdIntervalCheckbox").addEventListener("input", (event) => {
    // console.log(event.target.checked);
    document.querySelector("#verhoogdInterval").style.display = !event.target.checked ? "none": "block";
});

document.querySelector("#intervalAfterxMinutesSlider").addEventListener("input", (event) => {
    document.querySelector("#laatstexMinutenText").innerHTML = event.target.value;
});

document.querySelector("#laatsteIntervalSlider").addEventListener("input", (event) => {
    document.querySelector("#laatsteIntervalText").innerHTML = event.target.value/60;
});

document.querySelector("#phaseOneButton").addEventListener("click", (event) => {
    document.querySelector("#phaseOneWrapper").style.maxHeight = "0";
    document.querySelector("#phaseTwoWrapper").style.maxHeight = "unset";
    document.querySelector("#intervalAfterxMinutesSlider").max = document.querySelector("#durationSlider").value;
});

document.querySelector("#phaseTwoButton").addEventListener("click", (event) => {
    if(playerNameInput.value == ""){
        alert("Voer eerst een naam in");
        return;
    }
    document.querySelector("#phaseTwoWrapper").style.maxHeight= "0";
    document.querySelector("#phaseThreeWrapper").style.maxHeight = "unset";
    document.querySelector("#secondaryCircleTimeSlider").max = document.querySelector("#durationSlider").value;
})



var map = L.map("map-create").setView([51.942, 4.522], 13);
L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap France & OpenStreetMap contributors'
}).addTo(map);

var primaryCircle = L.circle(map.getCenter(), {
  radius: 300,
  color: 'red',
  fillOpacity: 0.2,
}).addTo(map);

var secondaryCircle = L.circle(map.getCenter(), {
  radius: 200,
  color: 'blue',
  fillOpacity: 0.2,
}).addTo(map);


map.on('move',function(e){
  if(!document.querySelector("#fixatePrimaryCircle").checked) primaryCircle.setLatLng(map.getCenter());
  if(!document.querySelector("#fixateSecondaryCircle").checked) secondaryCircle.setLatLng(map.getCenter());
  map._renderer._update();
});

document.querySelector("#primaryCircleRadiusSlider").addEventListener("input", (event) => {
    primaryCircle.setRadius(event.target.value);
    document.querySelector("#primaryRadiusLabel").innerHTML = event.target.value + "m";
});

document.querySelector("#secondaryCircleTimeSlider").addEventListener("input", (event) => {
    document.querySelector("#secondaryCircleTimeText").innerHTML = event.target.value;
})

document.querySelector("#secondaryCircleRadiusSlider").addEventListener("input", (event) => {
    secondaryCircle.setRadius(event.target.value);
    document.querySelector("#secondaryRadiusLabel").innerHTML = event.target.value + "m";
});

document.querySelector("#createGameButton").addEventListener("click", async (event) => {
    const obj = {};
    //     duration: seconds;
    //     interval: seconds;
    //     uitloop: seconds;
    //     lowerIntervalAfter: {
    //         interval: seconds;
    //         after: seconds;
    //     };
    //     player: string;
    //     primaryCircle: {
    //         lat: Long;
    //         lng: Long;
    //         radius: meters;
    //     };
    //     secondaryCircle: {
    //         lat: Long;
    //         lng: Long;
    //         radius: meters;
    //         after: seconds;
    //     };
    // }
    obj.duration = durationSlider.value * 60;
    obj.interval = Number(intervalSlider.value);
    console.log(uitloopTijdSlider.value);
    obj.uitloop = uitloopTijdSlider.value * 60;
    if(verhoogdIntervalCheckbox.checked){
        obj.lowerIntervalAfter = {
            interval: parseInt(laatsteIntervalSlider.value),
            after: intervalAfterxMinutesSlider.value * 60
        };
    } else {
        obj.lowerIntervalAfter = null;
    }
    obj.player = playerNameInput.value.replaceAll(/\s/g, ""); //take out all white space
    obj.primaryCircle = {
        lat: primaryCircle.getLatLng().lat,
        lng: primaryCircle.getLatLng().lng,
        radius: parseInt(primaryCircle.getRadius())
    };
    obj.secondaryCircle = {
        lat: secondaryCircle.getLatLng().lat,
        lng: secondaryCircle.getLatLng().lng,
        radius: parseInt(secondaryCircle.getRadius()),
        after: secondaryCircleTimeSlider.value * 60
    };

    console.log(obj);
    //TODO: send to server, await response, ...
    const options = await fetch(apiURL, {method: "OPTIONS"});
    console.log("fetched options");
    const response = await fetch(apiURL + "newgame/", {body:JSON.stringify(obj), method:"POST"});
    if(response.status != 200){
        alert(await response.json());
        return;
    }
    //else, assume all went well...
    const gameId = await response.text();
    StorageHandler.setGame(gameId, obj.player, null, null);
    window.location.replace("/jachtseizoen/frontend/ready.html?gameId=" + gameId);
});
