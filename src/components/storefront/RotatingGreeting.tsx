"use client";

import { useState, useEffect } from "react";
import { whimsicalGreetings } from "@/config/greetings";

export function RotatingGreeting() {
  const [greeting, setGreeting] = useState(whimsicalGreetings[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * whimsicalGreetings.length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(whimsicalGreetings[randomIndex]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-6 relative z-10 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {greeting}
    </h1>
  );
}
