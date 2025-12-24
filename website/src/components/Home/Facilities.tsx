import React from 'react';
import { Car, TreePine, Crown } from 'lucide-react';

const Facilities = () => {
  const facilities = [
    {
      icon: Car,
      title: 'PARKING',
      description: 'We provide free parking facilities in our hotel for two wheeler and four wheeler. So, you don\'t have to worry if you are planning to come in our hotel',
      buttonText: 'Explore More'
    },
    {
      icon: TreePine,
      title: 'PLAYGROUND',
      description: 'We Have Playgrounds and fitness areas add value to the resort experience and encourage families to visit and spend more time at your property.',
      buttonText: 'Explore More'
    },
    {
      icon: Crown,
      title: 'LUSH GREEN LAWNS',
      description: 'We Have free Lush Green Lawns in our Functions. So, you don\'t have to worry if you are planning to come in our',
      buttonText: 'Explore More'
    }
  ];

  return (
    <section id='facilities' className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium tracking-wider uppercase mb-2">FACILITIES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800">The area we cover under Z Hotel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facilities.map((facility, index) => (
            <div key={index} className="bg-black text-white rounded-lg overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-6 mx-auto">
                  <facility.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-center mb-6 tracking-wider">{facility.title}</h3>
                
                <p className="text-gray-300 leading-relaxed mb-8 flex-grow text-center">
                  {facility.description}
                </p>
                
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 flex items-center justify-center space-x-2 group">
                  <span>{facility.buttonText}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;