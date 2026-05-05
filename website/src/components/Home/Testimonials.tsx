import React from 'react';
import { Star, User } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Swathi Gowda',
      rating: 3,
      text: 'So far so okay in Puri. Staff here is you can more from the hotels outside of Puri. I would recommend this place if you need for the beach.',
      avatar: 'SG'
    },
    {
      name: 'Excellent Place',
      rating: 5,
      text: 'Hotel Z is a superb visit about food quite commendable, although not got a perfect refreshment close to a beach. But it is also interesting place to visit for historic ground.',
      avatar: 'EP'
    },
    {
      name: 'Excellent Place',
      rating: 5,
      text: 'Sweet n Pious should be the pleasure in the anniversary of the temple. Staff was friendly and the food was good. Highly recommend for a relaxing.',
      avatar: 'EP'
    },
    {
      name: 'Excellent',
      rating: 4,
      text: 'A clean and well maintained hotel. The staff is very helpful and the food is quite good. The location is perfect for visiting the temple.',
      avatar: 'EX'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <section id='testimonials' className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-amber-500 font-medium tracking-wider uppercase mb-2">TESTIMONIALS</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800">What customers say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <h4 className="font-semibold text-slate-800 mb-2">{testimonial.name}</h4>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {testimonial.text}
              </p>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-800">{testimonial.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;