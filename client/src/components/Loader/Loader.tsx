import React from 'react';
import './Loader.css';

interface LoaderProps {
  text?: string;
  textStyle?: string;
}

const Loader: React.FC<LoaderProps> = ({ text, textStyle = 'text-gray-600 mt-4 text-center' }) => {
  return (
    <section className="loader-container ">
      <div className="relative w-[90px] h-[103px] flex items-center justify-center">
        <div className="absolute w-[50px] h-[31px]">
          <div className="w-full h-full relative">
            <span className="one h6 absolute w-1 bg-primary z-50"></span>
            <span className="two h3 absolute w-1 bg-primary z-50"></span>
          </div>
        </div>
        <div className="absolute w-[50px] h-[31px] rotate-[60deg]">
          <div className="w-full h-full relative">
            <span className="one h1 absolute w-1 bg-primary z-50"></span>
          </div>
        </div>
        <div className="absolute w-[50px] h-[31px] rotate-[-60deg]">
          <div className="w-full h-full relative">
            <span className="two h2 absolute w-1 bg-primary z-50"></span>
          </div>
        </div>
        <div className="absolute w-[50px] h-[31px]">
          <div className="w-full h-full relative">
            <span className="one h4 absolute w-1 bg-primary z-50"></span>
          </div>
        </div>
      </div>
      {text && <p className={textStyle}>{text}</p>}
    </section>
  );
};

export default Loader;