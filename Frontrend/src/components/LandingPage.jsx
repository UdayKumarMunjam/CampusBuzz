import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "./Header";

export default function LandingPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [hiddenCards, setHiddenCards] = useState(new Set());
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  // Hero slider images and content
  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
      title: "Welcome to Campus",
      description:
        "Connect with your campus community, discover opportunities, and share your journey.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
      title: "Learn & Innovate",
      description:
        "Explore E-Cell and Code Club to build skills, launch projects, and shape your future.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      title: "Events & More",
      description:
        "Stay updated with notices, find lost items, and celebrate achievements together.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Scroll-triggered animations for feature cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardIndex = parseInt(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, cardIndex]));
            setHiddenCards((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cardIndex);
              return newSet;
            });
          } else {
            setHiddenCards((prev) => new Set([...prev, cardIndex]));
            setVisibleCards((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cardIndex);
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const cards = featuresRef.current?.querySelectorAll(".feature-card");
    cards?.forEach((card) => observer.observe(card));

    return () => {
      cards?.forEach((card) => observer.unobserve(card));
    };
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  };

  // Features with images (Events image replaced with Wikimedia Bharatanatyam photo)
  // inside your LandingPage.jsx

  // Features with images (only Events, Achievements, Lost & Found changed)
const features = [
  {
    title: "Feed",
    description:
      "Share updates, connect with CampusBuzz community, and stay engaged with your peers.",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Clubs",
    description:
      "Join E-Cell for entrepreneurship and Code Club for programming - build skills and networks.",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Events",
    description:
      "Discover exciting CampusBuzz events, workshops, and campus activities.",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Bharata_Natyam_Performance_DS.jpg",
  },
  {
    title: "Achievements",
    description:
      "Celebrate CampusBuzz student successes, placements, and milestones.",
    img: "/achievement.png",
  },
  {
    title: "E-Notice",
    description:
      "Stay informed with official CampusBuzz notices, announcements, and updates.",
    img: "/enotice.jpg",
  },
  {
    title: "Lost & Found",
    description:
      "Report and find lost items within the CampusBuzz community.",
    img: "/lost .jpeg",
  },
];




  return (
    <div className="min-h-screen bg-white">
      <Header onGetStarted={() => navigate('/login')} />
      {/* Page 1 – Hero Slider */}
      <section className="relative w-full h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={`slide-${index}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mb-6 drop-shadow-lg">
                {slide.description}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center space-x-2 drop-shadow-lg"
              >
                <span>Join CampusBuzz</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full shadow-lg ${
                index === current ? "bg-blue-500" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Page 2 – Features */}
      <section ref={featuresRef} className="py-20 bg-gray-50" id="features">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore CampusBuzz Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Discover tools designed to make your student life easier, fun, and
            more connected.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const scrollInAnimations = [
                "animate-slide-in-left",
                "animate-slide-in-bottom",
                "animate-slide-in-right",
                "animate-scale-in",
                "animate-slide-in-left",
                "animate-slide-in-bottom",
              ];

              const scrollOutAnimations = [
                "animate-slide-out-left",
                "animate-slide-out-bottom",
                "animate-slide-out-right",
                "animate-scale-out",
                "animate-slide-out-left",
                "animate-slide-out-bottom",
              ];

              const isVisible = visibleCards.has(index);
              const isHidden = hiddenCards.has(index);

              let scrollClass = "opacity-0";
              if (isVisible) {
                scrollClass =
                  scrollInAnimations[index % scrollInAnimations.length];
              } else if (isHidden) {
                scrollClass =
                  scrollOutAnimations[index % scrollOutAnimations.length];
              }

              return (
                <div
                  key={index}
                  data-index={index}
                  className={`feature-card bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-500 transform cursor-pointer animate-float ${scrollClass}`}
                  style={{
                    transitionDelay: isVisible ? `${index * 0.1}s` : "0s",
                  }}
                >
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={feature.img}
                      alt={feature.title}
                      className="w-full h-40 object-cover transition-all duration-500"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 transition-colors duration-300">
                      {feature.description}
                    </p>

                    {/* small image credit when available */}
                    {feature.credit && (
                      <p className="text-xs text-gray-400 mt-3">
                        Photo: {feature.credit}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Page 3 – CTA */}
      <section
        ref={ctaRef}
        className="relative py-20 bg-fixed bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8">
            Join thousands of students already experiencing CampusBuzz.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 CampusBuzz. Connecting students, building communities.
          </p>
        </div>
      </footer>
    </div>
  );
}
