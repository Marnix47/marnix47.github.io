import "./Departures.css";
import StationSelector from "./StationSelector.js";
import { useEffect, useRef, useState } from "react";

export default function Departures(){
    return (
        <div className="Departures">
            <StationSelector/>
        </div>
    )
}