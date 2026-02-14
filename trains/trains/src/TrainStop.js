import { useEffect, useRef, useState } from "react";
import "./TrainStop.css";

export function TrainStop({journeyData}){
    // const [data, setData] = useState(null);
    // // setData(journeyData);
    // useEffect(() => {
    //     setData(journeyData)
    // }, [journeyData]);
    const data = journeyData;
    const isArrival = data.status == "DESTINATION"
    const arrivalData = journeyData.arrivals[0];
    const departureData = journeyData.departures[0];

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
        let secondsCount = seconds % 60;
        if(secondsCount < 10) secondsCount = "0" + String(secondsCount)
        return Math.floor(seconds/60) + ":" + secondsCount;
    }

    return (
        <div className="TrainStop">
            <div className="TrainStopTimes">
                <div className="ArrivalTime" style={{color:"darkblue"}}>
                    {(arrivalData) && (<p className="ArrivalTime">
                        {getTimeOfDay(arrivalData.plannedTime)}
                    </p>)}
                    {(arrivalData?.delayInSeconds) ? (<p className="ArrivalDelay">
                        +{getDelayString(arrivalData.delayInSeconds)}
                    </p>): null}
                </div>
                <div className="DepartureTime" style={{color:"darkblue"}}>
                    {(departureData && !isArrival) && (<p className="DepartureTime">
                        {getTimeOfDay(departureData.plannedTime)}
                    </p>)}
                    {(departureData?.delayInSeconds && !isArrival) ? (<p className="DepartureDelay">
                        +{getDelayString(departureData.delayInSeconds)}
                    </p>):null}
                </div>
            </div>
            <div className="TrainStopProgressBar">
                <div className={data.status + " TrainStopBarVertical"}>

                </div>
                <div className={data.status + " TrainStopBarHorizontal"}>

                </div>
                <div className={data.status + " TrainStopBarOrigin"}>

                </div>
                <div className={data.status + " TrainStopBarDestination"}>

                </div>
            </div>
            <div className="TrainStopCrowdedness" style={{backgroundColor: getCrowdColor(departureData?.crowdForecast)}}></div>
            <div className="TrainStopStationName">
                <p className={data.stop.name + " StationName"}>{data.stop.name}</p>
            </div>
        </div>
    )
}   