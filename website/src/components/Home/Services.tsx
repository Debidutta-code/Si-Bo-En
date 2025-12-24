import React from 'react';
import { Utensils, Car, Wifi, Wind } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Utensils,
      title: 'Restaurant',
      description: 'Fine dining experience with local and international cuisine'
    },
    {
      icon: Car,
      title: 'Spacious Parking',
      description: 'Ample parking space for all types of vehicles'
    },
    {
      icon: Wifi,
      title: 'Free WiFi',
      description: 'High-speed internet connectivity throughout the property'
    },
    {
      icon: Wind,
      title: 'AC',
      description: 'Climate-controlled rooms for maximum comfort'
    }
  ];

  return (
    <section id='service' className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
            Our Services
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            Enjoy a wide range of facilities crafted to make your stay comfortable and memorable.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group hover:scale-[1.02] transition-transform duration-300 h-full"
            >
              <div className="bg-gray-50 rounded-xl p-6 sm:p-8 shadow-md group-hover:shadow-xl h-full flex flex-col justify-between text-center">
                <div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-amber-200 transition">
                    <service.icon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
