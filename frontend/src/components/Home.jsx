import { useState, useEffect } from 'react';

import HomeCards from './HomeCards';
import helpImage from '../assets/h3.jpg'; 

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Single carousel item
  const carouselItems = [
    {
      image: helpImage,
      title: "أَحبُّ الناس إلى الله أنفعهم للناس",
      description: "و الله في عون العبد ما كان العبد في عون أخيه",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Carousel Section */}
      <div className="relative h-[350px] w-full overflow-hidden">
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-transform duration-50 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">{item.title}</h1>
                <h3 className="text-4xl font-bold mb-4">{item.description}</h3>
              </div>
            </div>
          </div>
        ))}

       
      </div>

      {/* Existing Components */}
      
      <HomeCards />
    </div>
  );
};

export default Home;
