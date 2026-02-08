import "./InfiniteTrain.css";
import { useEffect, useRef, useState } from "react";

export default function InfiniteTrain({ speed = 300 }) {
  const trainURLs = [
    "https://vt.ns-mlab.nl/v1/images/virmm2_4.png",
    "https://vt.ns-mlab.nl/v1/images/slt_4.png",
    "https://vt.ns-mlab.nl/v1/images/icng_5.png",
    // "https://vt.ns-mlab.nl/v1/images/sng_3.png",
    "https://vt.ns-mlab.nl/v1/images/sng_3.png",
    "https://vt.ns-mlab.nl/v1/images/icr_9.png"
  ]
  // speed = pixels per second
  const refs = useRef([]);
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    // Measure all image widths once they are loaded
    const widths = refs.current.map(img =>
      img ? img.getBoundingClientRect().width : 0
    );

    const totalWidth = widths.reduce((a, b) => a + b, 0);

    // Duration = distance / speed
    setDuration(totalWidth / speed);
  }, []);

  return (
    <div className="train-wrapper">
      <div
        className="train-track"
        style={{ animationDuration: `${duration}s` }}
      >
        {/* Render two sequences for seamless looping */}
        {[...Array(2)].map((_, seqIndex) => (
          <div className="train-segment" key={seqIndex}>
            {trainURLs.map((url, i) => (
              <img
                key={seqIndex + "-" + i}
                src={url}
                className="train"
                ref={el => {
                  if (seqIndex === 0) refs.current[i] = el;
                }}
                alt=""
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

