"use client";

import { useEffect, useState } from "react";

export default function DiscountBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isClosed = localStorage.getItem("discount_closed");

    if (!isClosed) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("discount_closed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 flex items-center justify-center relative text-sm font-medium tracking-wide">
      
      <span>
        Launch Offer: <strong>First 5 Clients Get 20% OFF</strong> - Limited Slots Available
      </span>

      <button
        onClick={handleClose}
        className="absolute right-4 text-white hover:text-gray-300 text-lg font-bold"
      >
        ✕
      </button>
    </div>
  );
}