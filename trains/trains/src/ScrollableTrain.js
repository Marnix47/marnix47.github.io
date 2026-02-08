import "./ScrollableTrain.css"

export default function ScrollableTrain({units}){
      return (
        <div className="train-scroller">
            <div className="train-row">
                {units.map((unit, i) => (
                <div className="train-unit-wrapper" key={unit.stockIdentifier || i}>
                    <img
                    src={unit.image.uri}
                    alt={unit.stockIdentifier}
                    className="train-unit-image"
                    />
                </div>
                ))}
            </div>
        </div>
    );
}