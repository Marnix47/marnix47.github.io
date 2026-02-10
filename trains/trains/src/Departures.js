import DepartureItem from "./DepartureItem.js";
import "./Departures.css";
import { getDepartures, getArrivals } from "./ServerUtils.js";
import StationSelector from "./StationSelector.js";
import { useEffect, useRef, useState } from "react";

export default function Departures(){
    const [selectedStation, setSelectedStation] = useState("NWK");
    const [departureItems, setDepartureItems] = useState([]);
    let combinedData = [];
    useEffect(() => {
        combinedData = [];
        getDepartures(selectedStation, renderStations);
    }, [selectedStation]);

    function renderStations(data){
        combinedData = [];
        console.log(data);
        console.log(JSON.parse(data.target.response).payload.departures);
        const parsed = JSON.parse(data.target.response).payload.departures;
        combinedData = parsed.concat(combinedData);
        // getArrivals(selectedStation, renderArrivals);
        renderCombinedData();
    }

    function renderArrivals(data){
        console.log(data);
        console.log(combinedData);
        const parsed = JSON.parse(data.target.response).payload.arrivals;
        combinedData = parsed.filter(x => !combinedData.some(y => x.product.number == y.product.number)).concat(combinedData);
        console.log(combinedData);
        renderCombinedData();
    }

    function renderCombinedData(){
        combinedData.sort((a, b) => (a.plannedDateTime > b.plannedDateTime) - .5);
        setDepartureItems(combinedData.map((x,i) => (<div key={i}><DepartureItem partialData = {x} thisStationCode = {selectedStation}/></div>)));
    }

    return (
        <div className="Departures">
            <StationSelector onChange={(newStationCode) => setSelectedStation(newStationCode)}/>
            <div className="DeparturesList">
                {departureItems}
            </div>
        </div>
    )
}