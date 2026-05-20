"use client";

import { useEffect } from "react";

export default function MeezingenRedirect() {
  useEffect(() => {
    window.location.replace("/contact#meezingen");
  }, []);
  return null;
}
