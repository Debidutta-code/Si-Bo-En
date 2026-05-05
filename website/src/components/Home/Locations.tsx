import React from 'react';

const Location = () => {
  return (
    <section className="py-20 bg-cover bg-center bg-no-repeat relative"
             style={{
               backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop')`
             }}>
      <div className="container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="italic font-light">Location</span> We Are Coming Today
          </h2>
          
          <p className="text-xl md:text-2xl font-light mb-8">
Dubai, United Arab Emirates       
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 inline-block">
            <p className="text-lg">
              Experience the perfect blend of tradition and luxury at our prime location
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;