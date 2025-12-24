import React from 'react';

const NearbyPlaces = () => {
  const places = [
    {
      name: 'Puri',
      description: 'Puri is beautiful city situated in the state of Odisha in Eastern India, well the Cafe away from the capital of the state along the Bay of Bengal. It is an important pilgrimage center on the shoreline.',
      image: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      link: 'Read More'
    },
    {
      name: 'Shree Jagannath Temple',
      description: 'The temple is an important Hindu temple dedicated to Jagannath. The Jagannath Temple is an important Hindu temple dedicated to Jagannath, a form of Vishnu, in Puri in the state of Odisha on the eastern coast of India.',
      image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      link: 'Read More'
    },
    {
      name: 'Konark',
      description: 'The temple is famous for the last places in Odisha, one on the Bay of Bengal coastline in the Eastern of Puri. Konark is an important heritage site and is one of the most visited places in East India.',
      image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
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