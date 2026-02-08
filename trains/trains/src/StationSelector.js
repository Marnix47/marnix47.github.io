import { useState } from "react";
import "./StationSelector.css";

export default function StationSelector() {
    const [selected, setSelected] = useState("RTD");
    const stations = [
        {fullName: "Rotterdam C.", code: "RTD"},
        {fullName: "Nieuwerkerk", code: "NWK"},
        {fullName: "Delft", code: "DT"}
    ]
    return (
        <div className="station-container">
            {stations.map(station => (
                <button
                    key={station.code}
                    className={`station-btn ${selected === station.code ? "selected" : ""
                        }`}
                    onClick={() => setSelected(station.code)}
                >
                    {station.fullName}
                </button>
            ))}
        </div>
    );
}