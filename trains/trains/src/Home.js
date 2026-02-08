import "./Home.css"
import InfiniteTrain from "./InfiniteTrain"
import Departures from "./Departures";

export default function Home(){
    return (
        <div className="Home">
            <InfiniteTrain/>
            <header className="Home-header">

            </header>
            <Departures/>
        </div>
    )
}