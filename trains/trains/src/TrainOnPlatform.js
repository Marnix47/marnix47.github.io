import { useEffect, useRef, useState, useLayoutEffect} from "react";
import allPlatformsDataRaw from "./tracks.json";
import { getVirtualTrain } from "./ServerUtils";
import "./TrainOnPlatform.css"
import Bakbord from "./graphics/Bakbord.js";
const pxPm = 8;


export default function TrainOnPlatform({trainData}){
    const [thisStation, setThisStation] = useState(null);
    const [nextStation, setNextStation] = useState(null);
    const [prevStation, setPrevStation] = useState(null);
    const [platformData, setPlatformData] = useState(null);
    const [platformEnd, setPlatformEnd] = useState(0); //0 if train goes in base direction, length of platform otherwise
    const [platformObjects, setPlatformObjects] = useState(null);
    const [platformBakBorden, setPlatformBakBorden] = useState(null);
    const [virtualTrain, setVirtualTrain] = useState(null); //data from virtual train api
    const [trainType, setTrainType] = useState(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    // const allPlatformsData = JSON.parse(allPlatformsDataRaw);
    const allPlatformsData = allPlatformsDataRaw;
    var tempVirtualTrain = undefined;

    function getTrainOffset(platformBakBorden){
        let bakborden = platformBakBorden.toSorted((a,b) => parseInt(a.detail) > parseInt(b.detail) ? 1 : -1);
        let targetLength = virtualTrain.lengte;
        let sprinterConvert = [0,1,2,3,3,4,4,6,6,8,8,10,10,12]; //0-13
        let icngConvert = [0,0,0,0,0,4,0,0,6,0,8,0,0,10,0,12,12]; //0-16
        if(trainType == "SLT" || trainType == "SNG"){
            targetLength = sprinterConvert[targetLength];
        } else if(trainType == "ICNG"){
            targetLength = icngConvert[targetLength];
        }
        for(let bakbord of bakborden){
            if(parseInt(bakbord.detail) >= targetLength){
                return pxPm * bakbord.position - virtualTrain.lengteInMeters * Math.sign(platformEnd) * pxPm;
            }
        }
        return bakborden[bakborden.length - 1].position * pxPm - virtualTrain.lengteInMeters * Math.sign(platformEnd) * pxPm;
    }

    function getJourneyCode(){
        if(trainData.departures.length){
            return trainData.departures[0].product.number;
        }
        return trainData.arrivals[0].product.number;
    }

    function onVTFetched(d){
        const parsed = JSON.parse(d.target.response);
        setVirtualTrain(parsed);
        setTrainType(parsed.materieeldelen[0].type.split(" ")[0]);
        tempVirtualTrain = parsed;
        setLoading(false);
    }

    function getPlatformBakBorden(){
        if(!platformData) return;
        if(platformData.baseDirection.includes(nextStation) || platformData.otherDirection.includes(prevStation)){
            return platformData.bakborden.baseDirection;
        } else {
            return platformData.bakborden.otherDirection;
        }
    }

    /**
     * 
     * @param {*} unit name of unit
     * @returns length in meters
     */
    function getTrainLength(unit){
        switch(unit.type){
            case "SLT 4": return 69.4
            case "SLT 6": return 100.5
            case "VIRM IV":
            case "VIRMm1 IV":
            case "VIRMm2 IV":
                return 108.6;
            case "VIRM VI":
            case "VIRMm1 VI":
            case "VIRMm2 VI":
                return 162.1;
            case "DDZ 4": return 101.8;
            case "DDZ 6": return 154
            case "ICNG 5":
            case "ICNG-B 5":
            case "ICNG-D 5":
                return 110;
            case "ICNG 8":
            case "ICNG-B 8":
            case "ICNG-D 8":
                return 164.9;
            case "SNG 3": return 59.6;
            case "SNG 4": return 75.8;
            case "ICM 3": return 80.6;
            case "ICM 4": return 107.1;
            case "Flirt 3": return 63.2;
            case "Flirt 4": return 80.7;
            default: return 0.1;
        }
    }

    function getTotalLength(){
        return virtualTrain.materieeldelen.map(x => getTrainLength(x)).reduce((a, b) => a + b, 0);
    }

    useEffect(() => {
        if(!platformData) return;
        setPlatformObjects(platformData.objects);
        if(platformData.baseDirection.includes(nextStation) || platformData.otherDirection.includes(prevStation)){
            setPlatformBakBorden(platformData.bakborden.baseDirection)
            setPlatformEnd(0);
        } else {
            setPlatformBakBorden(platformData.bakborden.otherDirection);
            setPlatformEnd(platformData.length);
        }
    }, [platformData]);

    useEffect(() => {
        if(!trainData) return;
        setThisStation(trainData?.id?.replace("_0", ""));
        let tempStation = trainData?.id?.replace("_0", "");
        setNextStation(trainData?.nextStopId[0]?.replace("_0", ""));
        setPrevStation(trainData?.previousStopId[0]?.replace("_0", ""));
        let stationPlatformData = allPlatformsData.stations[tempStation];
        let platform = (() => {
            let platNum = trainData?.departures[0]?.actualTrack;
            if(platNum == undefined) platNum = trainData?.arrivals[0]?.actualTrack;
            return platNum;
        })();
        setPlatformData(stationPlatformData?.tracks[platform]);
        setLoading(true);
        getVirtualTrain(getJourneyCode(), onVTFetched);
    }, [trainData])

    useLayoutEffect(() => {
        if (!scrollRef.current) return;
        if (!platformData || !virtualTrain) return;

        const bakBorden = getPlatformBakBorden();
        if (!bakBorden) return;

        const offset = getTrainOffset(bakBorden) - 20;
        console.warn("USED EFFECT");
        console.warn(offset);
        scrollRef.current.scrollLeft = Math.max(0, offset);
        
    }, [loading]);

    if(!platformData || loading || !trainData) return (<div></div>);

    return (
        <div className="TrainOnPlatform">
            <div className="platform-wrapper" style={{width: platformData.length * pxPm}} ref={scrollRef}>
                <div className="train-wrapper" style={{marginLeft: getTrainOffset(getPlatformBakBorden())}}>
                    {virtualTrain.materieeldelen.map((unit, i) => (
                    <div className="train-unit-wrapper" key={unit.materieelnummer || i} style={{width: getTrainLength(unit) * pxPm}}>
                        <img
                        src={unit.afbeelding}
                        alt={unit.type}
                        className="train-unit-image"
                        />
                    </div>
                    ))}
                </div>
                <div className="overkapping-wrapper">
                    {
                        platformData.objects.filter(x => x.type == "overkapping").map((obj, i) => (
                            <div key={i} className="overkapping-object" style={{left:obj.startPosition * pxPm, width: (obj.endPosition - obj.startPosition) * pxPm}}></div>
                        ))
                    }
                </div>
                <div className="objects-wrapper">
                    {
                        platformData.bakborden.baseDirection.map((bord, i) => (
                            <div key = {i}className="platform-object" style={{left:bord.position * pxPm - 12}}><Bakbord number={bord.detail}/></div>
                        ))
                    }
                    {
                        platformData.bakborden.otherDirection.map((bord, i) => (
                            <div key={i} className="platform-object" style={{left:bord.position * pxPm - 12}}><Bakbord number={bord.detail}/></div>
                        ))
                    }
                    {
                        platformData.objects.filter(x => x.type != "overkapping").map((object, i) => (
                            <div key={i} className="platform-object" style={{left:object.position * pxPm - 6}}>
                                <img src={`/${object.type}.svg`}></img>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

