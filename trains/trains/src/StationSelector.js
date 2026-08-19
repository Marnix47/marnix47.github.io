import { useState } from "react";
import "./StationSelector.css";

export default function StationSelector({onChange}) {
    const [selected, setSelected] = useState("NWK");
    const stations = [
        {fullName: "RTD", code: "RTD"},
        {fullName: "NWK", code: "NWK"},
        {fullName: "DT", code: "DT"},
        {fullname: "GD", code: "GD"},
        {fullname: "SDM", code: "SDM"},
        {fullname: "RTB", code: "RTB"},
        {fullname: "RTA", code: "RTA"},
        {fullname: "UT", code: "UT"},
        {fullname: "DDR", code: "DDR"},
        {fullname: "EHV", code: "EHV"},
        {fullname: "GV", code: "GV"},
        {fullname: "GVC", code: "GVC"},
        {fullname: "LAA", code: "LAA"},

    ]
    return (
        <div className="station-container">
            {stations.map(station => (
                <button
                    key={station.code}
                    className={`station-btn ${selected === station.code ? "selected" : ""
                        }`}
                    onClick={() => {setSelected(station.code); onChange(station.code);}}
                >
                    {station.fullName}
                </button>
            ))}
        </div>
    );
}