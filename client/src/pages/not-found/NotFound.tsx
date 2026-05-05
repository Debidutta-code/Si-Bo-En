import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

// 1. Define the shape of our star objects
interface Star {
  width: string;
  height: string;
  top: string;
  left: string;
  animationDelay: string;
  animationDuration: string;
}

const NotFound = () => {
  const location = useLocation();
  
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    const generatedStars: Star[] = [...Array(30)].map(() => ({
      width: Math.random() * 4 + 1 + "px",
      height: Math.random() * 4 + 1 + "px",
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      animationDelay: Math.random() * 3 + "s",
      animationDuration: Math.random() * 3 + 2 + "s",
    }));
    setStars(generatedStars);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-white overflow-hidden relative">
      
      {/* Inject custom keyframes */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.1; transform: translateY(0); }
            50% { opacity: 0.8; transform: translateY(-10px); }
          }
        `}
      </style>

      {/* Animated Background Particles (Stars) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-primary rounded-full opacity-20"
            style={{
              width: star.width,
              height: star.height,
              top: star.top,
              left: star.left,
              animation: `twinkle ${star.animationDuration} ease-in-out infinite`,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6 animate-fade-in-up">
        {/* Floating 404 Heading */}
        <div className="animate-float">
          <h1 className="text-9xl md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r bg-black drop-shadow-2xl mb-2">
            404
          </h1>
        </div>

        {/* Subheading and Text */}
        <div className="opacity-0 animate-[fadeIn_1s_ease-in-out_0.4s_forwards]">
          <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4 tracking-wide">
            Lost in Space
          </h2>
          <p className="text-lg md:text-xl text-black mb-8 max-w-md mx-auto">
            The page you are looking for has drifted into the vast unknown. Let's get you back to safety.
          </p>
        </div>

        {/* Interactive Button */}
        <div className="opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
          <Link
            to="/app"
            className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-300 bg-primary rounded-full hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-gray-900"
          >
            <span className="flex items-center gap-2">
              Return to Home
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </Link>
        </div>
      </div>
      
      {/* Utility keyframes for entrance animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default NotFound;