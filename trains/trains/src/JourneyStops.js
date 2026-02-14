import { useEffect, useRef, useState } from "react";
import {TrainStop} from "./TrainStop.js"
import StationSelector from "./StationSelector";

export default function JourneyStops({journeyData}){
    return (
        <div className="JourneyStops">
            {journeyData.filter(x => x.status != "PASSING").map((x, i) => (<TrainStop journeyData = {x} key={i} />))}
        </div>
    )
}