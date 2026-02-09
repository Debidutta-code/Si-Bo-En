import { useEffect } from 'react';
import { MapPin,Quote, ChevronRight } from 'lucide-react';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { useBooking } from '@/contexts/BookingContext';
import { useFetchRooms } from '@/hooks/useFetchRooms';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
const hotelHeroImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80';

import { services, facilities, testimonials, nearbyAttractions } from './utils';

export default function LandingPage() {



  return (
    <div className="min-h-screen bg-background">
      {/* Full-screen Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image - Full screen hero */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${hotelHeroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Header with Logo */}
        <header className="container relative z-10 p-3 flex items-center justify-end">
          <Button variant="outline" className="bg-white/90 backdrop-blur-sm border-0 text-foreground hover:bg-white">
            My Booking
          </Button>
        </header>

        {/* Hero Content */}
        <div className="relative z-10  flex flex-col items-center justify-center text-center p-4">
          <div className="space-y-4 mb-8 fade-in">            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight max-w-4xl drop-shadow-lg">
              Find Your Perfect Stay
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Discover amazing comfort at exclusive rates. Experience luxury and world-class hospitality.
            </p>
          </div>
        </div>

        {/* Booking Widget - Overlapping hero and content */}
        <div className="container relative z-10 pb-8 -mb-24">
          <div className="max-w-4xl mx-auto fade-in" style={{ animationDelay: '0.2s' }}>
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="pt-32 pb-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Services</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enjoy a wide range of facilities crafted to make your stay comfortable and memorable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card 
                key={service.title} 
                className="text-center card-hover fade-in border-0 shadow-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Facilities</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Experience Our Premium Facilities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a perfect stay, all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <Card 
                key={facility.title} 
                className="overflow-hidden card-hover fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={facility.image} 
                    alt={facility.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <facility.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{facility.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{facility.description}</p>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Explore More <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Guests Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it — hear from our satisfied guests.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name} 
                className="card-hover fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {testimonial.initials}
                    </div>
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Attractions Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Attractions</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nearby Places & Things to Do
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the best attractions and experiences around our property.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {nearbyAttractions.map((attraction, index) => (
              <Card 
                key={attraction.title} 
                className="overflow-hidden card-hover fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={attraction.image} 
                    alt={attraction.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{attraction.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{attraction.description}</p>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Read More <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Luxury?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Book your stay today and discover why our guests keep coming back.
          </p>
          <Button 
            size="xl" 
            variant="secondary"
            className="font-semibold"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Book Now
          </Button>
        </div>
      </section>

    </div>
  );
}
