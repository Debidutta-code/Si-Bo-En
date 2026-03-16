import React from 'react';
import SearchWidget from './SearchWidget';
import ROOMBG from '../assets/ROOMBG.jpg';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${ROOMBG.src})`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pb-14">
        <div className="text-center mb-8 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("Hero.title")}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto">
            {t("Hero.subtitle")}
          </p>
        </div>

        {/* Search Widget */}
        <SearchWidget />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-indigo-500 bg-opacity-20 rounded-full blur-2xl"></div>
    </div>
  );
};

export default Hero;