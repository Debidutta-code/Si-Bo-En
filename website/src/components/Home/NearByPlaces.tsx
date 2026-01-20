import React from 'react';

const NearbyPlaces = () => {
  const places = [
    {
      name: 'Burj Khalifa',
      description: 'The world\'s tallest building standing at 828 meters, offering breathtaking views of Dubai from its observation decks. Experience luxury shopping, fine dining, and the spectacular Dubai Fountain show at its base.',
      image: 'https://images.pexels.com/photos/10885330/pexels-photo-10885330.jpeg',
      link: 'Read More'
    },
    {
      name: 'Sheikh Zayed Grand Mosque',
      description: 'One of the largest mosques in the world located in Abu Dhabi, featuring stunning white marble domes and intricate Islamic architecture. A masterpiece showcasing traditional craftsmanship with modern design elements.',
      image: 'https://images.pexels.com/photos/31027802/pexels-photo-31027802.jpeg',
      link: 'Read More'
    },
    {
      name: 'Dubai Marina',
      description: 'A stunning waterfront district with luxurious yachts, world-class restaurants, and vibrant nightlife. Enjoy a leisurely walk along the promenade or take a traditional dhow cruise to experience Dubai\'s modern skyline.',
      image: 'https://images.pexels.com/photos/30063500/pexels-photo-30063500.jpeg',
      link: 'Read More'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium tracking-wider uppercase mb-2">ATTRACTIONS</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800">Nearby Places and Things to do</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {places.map((place, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative overflow-hidden">
                <img 
                  src={place.image}
                  alt={place.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">{place.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  {place.description}
                </p>
                <button className="text-amber-500 hover:text-amber-600 font-semibold flex items-center space-x-1 group">
                  <span>{place.link}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default NearbyPlaces;