"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearBookingContext } from "@/src/store/bookingSlice";
import Hero from "@/src/components/Home/Hero";
import Services from "@/src/components/Home/Services";
import Facilities from "@/src/components/Home/Facilities";
import Location from "@/src/components/Home/Locations";
import Testimonials from "@/src/components/Home/Testimonials";
import NearbyPlaces from "@/src/components/Home/NearByPlaces";
import Navbar from "../components/Home/Navbar";

export default function Home() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearBookingContext());
    localStorage.removeItem("bookingContext");
    localStorage.removeItem("bookingstorage");

  }, []);

  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      {/* <Facilities />
      <Location />
      <Testimonials />
      <NearbyPlaces /> */}
    </main>
  );
}
