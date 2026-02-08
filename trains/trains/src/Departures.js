import DepartureItem from "./DepartureItem.js";
import "./Departures.css";
import { getDepartures } from "./ServerUtils.js";
import StationSelector from "./StationSelector.js";
import { useEffect, useRef, useState } from "react";

export default function Departures(){
    const [selectedStation, setSelectedStation] = useState("NWK");
    const [departureItems, setDepartureItems] = useState([]);
    useEffect(() => {
        getDepartures(selectedStation, renderStations);
    }, [selectedStation]);

    function renderStations(data){
        console.log(data);
        console.log(JSON.parse(data.target.response).payload.departures);
        const parsed = JSON.parse(data.target.response).payload.departures;
        setDepartureItems(parsed.map((x,i) => (<div key={i}><DepartureItem partialData = {x} thisStationCode = {selectedStation}/></div>)))
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