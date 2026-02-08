import "./DepartureItem.css";
import { useEffect, useRef, useState } from "react";
import { getJourney } from "./ServerUtils";
import ScrollableTrain from "./ScrollableTrain.js";

export default function DepartureItem({partialData, thisStationCode}){
    const [data, setData] = useState(null);
    const [platform, setPlatform] = useState(null);
    const [viaRecognizable, setViaRecognizable] = useState(undefined);
    const [journeyThisStationData, setJourneyThisStationData] = useState(undefined);
    const [journeyThisStationArrival, setJourneyThisStationArrival] = useState(undefined);
    const [journeyStock, setJourneyStock] = useState(undefined);
    useEffect(() => {
        getJourney(partialData.product.number, onFetched);
    }, [partialData.product.number]);

    function onFetched(d){
        console.info("Departure item fetched");
        const parsed = JSON.parse(d.target.response).payload;
        setData(parsed);
        const thisStationData = parsed.stops.find(x => x.id === thisStationCode || x.id === thisStationCode + "_0");
        if(!thisStationData){
            console.error("NO SPECIFIC STATION DATA FOR JOURNEY");
        } else {
            setJourneyThisStationData(thisStationData.departures[0]);
            setJourneyThisStationArrival(thisStationData.arrivals[0]);
            setJourneyStock(thisStationData.actualStock);
        }
    }

    function getCrowdColor(crowd){
        switch(crowd){
            case "LOW": return "green";
            case "MEDIUM": return "orange";
            case "HIGH": return "red";
            default: return "gray";
        }
    }

    function getTimeOfDay(string){
        let date = new Date(string);
        let hours = date.getHours();
        if(hours < 10) hours = "0" + String(hours);
        let minutes = date.getMinutes();
        if(minutes < 10) minutes = "0" + String(minutes);
        return hours + ":" + minutes;
    }

    function getDelayString(seconds){
        let num = parseInt(seconds);
        let secondsCount = seconds % 60;
        // if(secondsCount == 0) secondsCount = "00";
        if(secondsCount < 10) secondsCount = "0" + String(secondsCount)
        return Math.floor(seconds/60) + ":" + secondsCount;
    }

    function getDepartureInfo(){
        if(!partialData){
            return "";
        }
        if(partialData.messages.length == 0){
            if(partialData.cancelled) return "Cancelled";
            return "Via " + partialData.routeStations.map(x => x.mediumName).join(", ");
        } else {
            return partialData.messages.map(x => x.message).join(" - ");
        }
    }

    return (
        <div className="DepartureItem">
            <div className="DepartureItemHeader">
                <p className="DepartureItemHeaderName" style={{color:!partialData.cancelled ? "black" : "lightgray"}}>{partialData.direction}</p>
                <div className="DepartureItemHeaderRight">
                    {partialData.recognizableDestination && (<div className="ViaRecognizable">
                        <p className="ViaRecognizableText">Via {partialData.recognizableDestination.name}</p>
                    </div>)}

                    <div className="DepartureItemCrowdedness" style={{backgroundColor: journeyThisStationData ? getCrowdColor(journeyThisStationData.crowdForecast): "gray"}}>
                    </div>

                    {journeyThisStationData && (
                        <p className="DeparturePlatform"
                            style={journeyThisStationData.plannedTrack === journeyThisStationData.actualTrack
                                ? {color: "black"} : {color: "red"}}>
                            {journeyThisStationData.actualTrack}
                        </p>
                    )}

                </div>
            </div>
            <div className="DepartureItemMiddle">
                <div className="DepartureItemTimesWrapper">
                    {journeyThisStationArrival && (<p className="DepartureItemArrivalTimes">
                        A: {getTimeOfDay(journeyThisStationArrival.plannedTime)}
                    </p>)}
                    {(journeyThisStationArrival && journeyThisStationArrival.delayInSeconds != 0) && (<p className="DepartureItemArrivalDelay">
                        +{getDelayString(journeyThisStationArrival.delayInSeconds)}
                    </p>)}
                    {journeyThisStationData && (<p className="DepartureItemDepartureTimes">
                        D: {getTimeOfDay(journeyThisStationData.plannedTime)}
                    </p>)}
                    {(journeyThisStationData && journeyThisStationData.delayInSeconds != 0) && (<p className="DepartureItemDepartureDelay">
                        +{getDelayString(journeyThisStationData.delayInSeconds)}
                    </p>)}
                </div>
                <p className="DepartureInfo" style={{color:partialData.cancelled ? "red" : "darkslategray"}}>
                    {getDepartureInfo()}
                </p>
            </div>
            <div className="DepartureItemBottom">
                {journeyThisStationData && journeyStock && (<ScrollableTrain units={journeyStock.trainParts}/>)}
            </div>
            
        </div>
    )
}