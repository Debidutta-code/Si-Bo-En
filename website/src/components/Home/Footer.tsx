"use client";
import { usePathname } from "next/navigation";
import { MapPin, Mail, Phone } from "lucide-react";
import Image from "next/image";
import SLogo from "../assets/SLogo.png";
import ZLogo from "../assets/ZLogo.png";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";

const Footer = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const bookingContext = useSelector((state: RootState) => state.booking);
  
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);

  // ✅ UPDATED: More aggressive logo checking
useEffect(() => {
  const updateLogoFromStorage = () => {
    console.log('🔍 Footer: Checking for logo update...');
    
    // Priority 1: Check bookingContext
    const logoFromContext = 
      bookingContext?.bookingEngineColor?.logo || 
      bookingContext?.PropertyDetails?.bookingEngineConfig?.logo;
    
    console.log('📦 Footer logoFromContext:', logoFromContext);
    
    if (logoFromContext) {
      console.log('✅ Footer: Setting logo from context:', logoFromContext);
      setCurrentLogo(logoFromContext);
      return;
    }

    // Priority 2: Check localStorage
    try {
      const stored = localStorage.getItem('bookingstorage');
      console.log('💾 Footer localStorage:', stored);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📋 Footer parsed:', parsed);
        
        if (parsed.logoIcon) {
          console.log('✅ Footer: Setting logo from storage:', parsed.logoIcon);
          setCurrentLogo(parsed.logoIcon);
          return;
        }
      }
      
      console.log('❌ Footer: No logo found');
      setCurrentLogo(null);
    } catch (error) {
      console.error('❌ Footer error:', error);
      setCurrentLogo(null);
    }
  };

  updateLogoFromStorage();

  const handleStorageUpdate = () => {
    console.log('🔔 Footer: Storage event triggered');
    updateLogoFromStorage();
  };

  window.addEventListener('storage', handleStorageUpdate);
  window.addEventListener('bookingStorageUpdated', handleStorageUpdate);

  return () => {
    window.removeEventListener('storage', handleStorageUpdate);
    window.removeEventListener('bookingStorageUpdated', handleStorageUpdate);
  };
}, [bookingContext.PropertyCode]); // ✅ Watch entire bookingContext object
  const contactInfo = [
    {
      icon: MapPin,
      text: "Arena-3, 3rd Floor, STPI ELITE Building, Gothapatna, Khordha, Odisha - 751003",
    },
    { icon: Phone, text: "+91 9777403555" },
    {
      icon: Mail,
      text: (
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=info@swiftrooms.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-500 transition-colors duration-200"
        >
          info@swiftrooms.ai
        </a>
      ),
    },
  ];

  console.log('🎨 Footer rendering with currentLogo:', currentLogo);

  return (
    <footer id="contact" className="bg-gray-300 text-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center">
              {currentLogo ? (
                <div className="relative w-48 h-20">
                  <Image
                    src={currentLogo}
                    alt="Hotel Logo"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <Image
                  src={isHomePage ? ZLogo : SLogo}
                  alt="Company Logo"
                  width={isHomePage ? 120 : 200}
                  height={80}
                  className="object-contain"
                />
              )}
            </div>
            <p className="text-gray-900 text-sm mt-4">
              Discover great stays and travel deals with us. Your journey starts
              here. Experience comfort, convenience, and personalized service at
              every step.
            </p>
          </div>
          <div className="hidden md:block"></div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              {contactInfo.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <item.icon className="w-5 flex-shrink-0 h-5 text-indigo-400 mt-1" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block"></div>
        </div>

        <div className="border-t  border-gray-800 mt-10 pt-6 text-end text-gray-900 text-sm">
          © {new Date().getFullYear()} Swiftrooms. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;