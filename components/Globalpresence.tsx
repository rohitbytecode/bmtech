"use client";

import { useEffect, useRef, useState } from "react";

const clients = [
    { id: 1, x: 1500, y: 850 }, // USA
    { id: 2, x: 3600, y: 600 }, // UK
    { id: 3, x: 5350, y: 1300 }, // India
    { id: 4, x: 6850, y: 2450 }, // Australia
];

export default function WorldMap() {
    const imgRef = useRef<HTMLImageElement>(null);

    const [size, setSize] = useState({
        width: 1,
        height: 1,
        naturalWidth: 1,
        naturalHeight: 1,
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const update = () => {
            const img = imgRef.current;
            if (!img || !img.naturalWidth) return;

            setSize({
                width: img.clientWidth,
                height: img.clientHeight,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
            });
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [isLoaded]);

    return (

        <div className="w-full">

            {/* Text ABOVE the image */}
            <p className="text-center text-xs text-white/60 uppercase tracking-[0.25em] mb-4">
                Global Client Presence
            </p>
            <div className="relative w-full h-[350px] overflow-hidden rounded-xl">
                <img
                    ref={imgRef}
                    src="/world-mapv1.png"
                    alt="world map"
                    onLoad={() => setIsLoaded(true)}
                    className="w-full h-full object-contain opacity-40 grayscale brightness-125"
                />

                {clients.map((point) => {
                    let renderedWidth = size.width;
                    let renderedHeight = size.height;
                    let xOffset = 0;
                    let yOffset = 0;

                    if (size.naturalWidth > 0 && size.naturalHeight > 0) {
                        const imgRatio = size.naturalWidth / size.naturalHeight;
                        const containerRatio = size.width / size.height;

                        if (containerRatio > imgRatio) {
                            renderedHeight = size.height;
                            renderedWidth = size.height * imgRatio;
                            xOffset = (size.width - renderedWidth) / 2;
                        } else {
                            renderedWidth = size.width;
                            renderedHeight = size.width / imgRatio;
                            yOffset = (size.height - renderedHeight) / 2;
                        }
                    }

                    const left = xOffset + (point.x / size.naturalWidth) * renderedWidth;
                    const top = yOffset + (point.y / size.naturalHeight) * renderedHeight;

                    return (
                        <div
                            key={point.id}
                            className="absolute"
                            style={{
                                left,
                                top,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {/* Glow */}
                            <span
                                className="absolute w-8 h-8 rounded-full animate-glow"
                                style={{
                                    background:
                                        "radial-gradient(circle, rgba(59,130,246,0.9) 0%, rgba(59,130,246,0.4) 25%, rgba(59,130,246,0.1) 50%, transparent 75%)",
                                }}
                            />

                            {/* Core */}
                            <span className="relative w-[4px] h-[4px] bg-blue-400 rounded-full animate-coreGlow" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}