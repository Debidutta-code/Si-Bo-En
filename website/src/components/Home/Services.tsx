import React from "react";
import revchilliLogo from "../assets/revchilli.png";

const services = [
  {
    title: "DIGITAL MARKETING",
    description:
      "We craft tailored marketing strategies that highlight your unique offerings and drive guests to book directly through your website — boosting reservations and reducing reliance on third-party platforms.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200",
  },
  {
    title: "WEB DESIGN",
    description:
      "Your website is your online identity. An optimized, mobile-friendly website is the first step toward winning control of your online business and converting visitors into bookings.",
    image:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1200",
  },
  {
    title: "LOYALTY PROGRAM",
    description:
      "Turn loyalty into your competitive advantage. Offer value-added benefits to registered customers and differentiate your brand from competitors.",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1200",
  },
  {
    title: "BOOKING ENGINE",
    description:
      "Boost direct reservations with our plug-in booking engine integrated with your property management system. Secure, mobile-friendly and optimized for conversion.",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200",
  },
  {
    title: "AI CHATBOT",
    description:
      "Engage guests smarter with AI. Route requests, convert leads, enrich CRM data and drive more direct bookings.",
    image:
      "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?q=80&w=1200",
  },
  {
    title: "DISTRIBUTION MANAGEMENT",
    description:
      "Maximize ROI and efficiency. Manage daily revenue tasks, maintain healthy distribution channels and strengthen your hotel's online presence.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200",
  },
];

export default function Services() {
  return (
    <div className="bg-white text-gray-800">
      {/* Top Hero Section (No Nav) */}
      <section className="bg-[#f2f2f2] border-b border-gray-300 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <img
            src={revchilliLogo.src}
            alt="RevChill logo"
            className="mx-auto h-24 md:h-28 w-auto mb-10"
          />
          <h1 className="text-2xl md:text-4xl font-bold text-[#1A98A6] tracking-wide leading-tight">
            UNLOCK YOUR FULL
            <br />
            REVENUE POTENTIAL
          </h1>
          <p className="max-w-4xl mx-auto mt-8 text-xl text-black leading-relaxed">
            If you are ready to cut down on hefty commissions, increase direct
            bookings, and secure the long-term success of your hotel, partner
            with us and take the next step toward a future-proof hospitality
            business.
          </p>
          <button className="mt-10 bg-[#1A98A6] hover:bg-[#168894] text-white px-10 py-4 rounded-2xl font-semibold tracking-[0.2em]">
            CONTACT US
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-center text-[#1A98A6] mb-4">
          OUR SERVICES
        </h2>
        <p className="text-center text-gray-600 mb-16">
          Dive into the new age of hospitality solutions with us
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-[#1A98A6] text-white rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={service.image}
                alt={service.title}
                className="h-64 w-full object-cover"
              />
              <div className="p-8">
                <h4 className="text-2xl font-semibold mb-4">
                  {service.title}
                </h4>
                <p className="text-white/90 mb-6">{service.description}</p>
                <button className="bg-white text-[#1A98A6] px-6 py-2 rounded font-medium hover:bg-gray-100">
                  Consult with us
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gray-100 py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
          <h3 className="text-3xl font-bold text-[#1A98A6] mb-6">
            YOUR TRUSTED PARTNER IN DIRECT BOOKING SUCCESS
          </h3>
          <p className="text-gray-600 mb-6">
            Slash commission costs and increase your earnings by joining
            RevChill today.
          </p>
          <button className="bg-[#1A98A6] hover:bg-[#168894] text-white px-8 py-3 rounded font-medium">
            GET A FREE CONSULTATION
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A98A6] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-semibold mb-2">Phone</h4>
            <p>+971 (04) 5878 776</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Email</h4>
            <p>info@revchill.com</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Follow</h4>
            <div className="flex justify-center md:justify-start space-x-4 mt-2">
              <div className="w-8 h-8 bg-white text-[#1A98A6] rounded-full flex items-center justify-center">
                f
              </div>
              <div className="w-8 h-8 bg-white text-[#1A98A6] rounded-full flex items-center justify-center">
                in
              </div>
              <div className="w-8 h-8 bg-white text-[#1A98A6] rounded-full flex items-center justify-center">
                ig
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-10 text-sm opacity-80">
          ©2020 by RevChill
        </p>
      </footer>
    </div>
  );
}
