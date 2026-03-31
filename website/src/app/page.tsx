"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearBookingContext } from "@/src/store/bookingSlice";
import Hero from "@/src/components/Home/Hero";
import Services from "@/src/components/Home/Services";

export default function Home() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearBookingContext());
  }, []);

  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
    </main>
  );
}
