"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedOnScroll from "@/components/AnimatedOnScroll";

export default function Home() {
  // Define instructors
  const instructors = useMemo(
    () => [
      {
        name: "travis",
        image: "/travis.webp",
        review:
          "⭐⭐⭐⭐⭐ Fantastic instructor, extremely patient and knowledgeable.",
      },
      {
        name: "lincon",
        image: "/lincon.webp",
        review: "⭐⭐⭐⭐⭐ Very professional and attentive to details.",
      },
      {
        name: "sophia",
        image: "/sophia.webp",
        review: "⭐⭐⭐⭐⭐ A great teacher who makes learning fun and easy.",
      },
      {
        name: "james",
        image: "/james.webp",
        review: "⭐⭐⭐⭐⭐ Provides clear guidance and exceptional support.",
      },
      {
        name: "anna",
        image: "/anna.webp",
        review: "⭐⭐⭐⭐⭐ Innovative methods and a friendly approach.",
      },
      {
        name: "martin",
        image: "/martin.jpg",
        review:
          "⭐⭐⭐⭐⭐ Outstanding instructor with a wealth of experience.",
      },
      {
        name: "guild",
        image: "/guild.jpg",
        review:
          "⭐⭐⭐⭐⭐ Patient and well-structured lessons that build confidence.",
      },
    ],
    []
  );

  // Modal state to toggle overlay visibility
  const [showModal, setShowModal] = useState(false);

  // Next.js router for navigation
  const router = useRouter();

  return (
    <div className="font-sans relative">
      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
        <div className="text-2xl font-bold text-white">Driving School</div>
        <div className="space-x-4">
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-transparent border border-white text-white rounded-md hover:bg-white hover:text-black transition"
          >
            Login
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 transition"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* LANDING SECTION */}
      <section className="relative h-screen w-full">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          src="video.mp4"
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <AnimatedOnScroll animationClass="animate-slideInDown" delay="0s">
            <h1
              className="text-5xl font-bold"
              style={{
                WebkitTextStroke: "1px black",
                WebkitTextFillColor: "gold",
              }}
            >
              Learn to Drive with Confidence
            </h1>
          </AnimatedOnScroll>
          <AnimatedOnScroll animationClass="animate-slideInDown" delay="0.3s">
            <p className="mt-4 text-xl text-white">
              Connect with top-rated instructors, choose your language, and start your journey to becoming a skilled driver.
            </p>
          </AnimatedOnScroll>
          <div className="mt-6">
            <AnimatedOnScroll animationClass="animate-slideInDown" delay="0.5s">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-green-900 text-white rounded-md hover:bg-black hover:text-white transition mr-4"
              >
                Get Started
              </button>
              <button className="px-6 py-3 bg-white text-green-900 rounded-md hover:bg-green-900 hover:text-white transition">
                Learn More
              </button>
            </AnimatedOnScroll>
          </div>
        </div>
      </section>

      {/* ICONS SECTION */}
      <section className="py-10 bg-[#1a1a1a]">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 gap-x-[30px]">
            <AnimatedOnScroll animationClass="animate-fadeIn" delay="0.3s">
              <div className="flex flex-col items-center text-center">
                <img src="/maps.svg" alt="Choose Your Area" className="w-16 h-16" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Choose Your Area
                </h3>
              </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-fadeIn" delay="0.5s">
              <div className="flex flex-col items-center text-center">
                <img src="/group.svg" alt="Top Instructors" className="w-16 h-16" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Top Instructors
                </h3>
              </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-fadeIn" delay="0.7s">
              <div className="flex flex-col items-center text-center">
                <img src="/globev.svg" alt="Multiple Languages" className="w-16 h-16" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Multiple Languages
                </h3>
              </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-fadeIn" delay="0.9s">
              <div className="flex flex-col items-center text-center">
                <img src="/shield.svg" alt="Safe & Secure" className="w-16 h-16" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Safe & Secure
                </h3>
              </div>
            </AnimatedOnScroll>
          </div>
        </div>
      </section>

      {/* SAFETY SECTION */}
      <section className="py-16 px-6 md:px-20 bg-gray-100 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 flex justify-center">
          <AnimatedOnScroll animationClass="animate-slideInLeft" delay="0.3s">
            <img
              src="/7299149.jpg"
              alt="Safety First"
              className="w-full max-w-md rounded-lg shadow-lg"
            />
          </AnimatedOnScroll>
        </div>
        <div className="md:w-1/2 text-center md:text-left mt-8 md:mt-0">
          <AnimatedOnScroll animationClass="animate-slideInRight" delay="0.3s">
            <h2 className="text-4xl font-bold text-gray-900">
              Your Safety Comes First
            </h2>
          </AnimatedOnScroll>
          <AnimatedOnScroll animationClass="animate-fadeIn" delay="0.5s">
            <p className="mt-4 text-gray-700">
              We prioritize your safety from the moment you begin your training. Before, during, and after every session, our commitment to you never wavers.
              Our vehicles are meticulously sanitized to ensure a secure journey. With real-time support always at hand, your well-being remains our utmost priority.
            </p>
          </AnimatedOnScroll>
        </div>
      </section>

      {/* WHY CHOOSE US? SECTION */}
      <section className="py-16 px-6 md:px-20 bg-green-100">
        <AnimatedOnScroll animationClass="animate-fadeInUp" delay="0.3s">
          <h2 className="text-4xl font-bold text-center text-black mb-8">
            Why Choose Us?
          </h2>
        </AnimatedOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatedOnScroll animationClass="animate-fadeInUp" delay="0.4s">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-2 flex items-center">
                <img src="/message.svg" alt="Chat" className="w-10 h-10 mr-2" />
                Chat with Instructors
              </h3>
              <p className="text-gray-800">
                Easily connect via our in-app chat for quick answers and real-time support.
              </p>
            </div>
          </AnimatedOnScroll>
          <AnimatedOnScroll animationClass="animate-fadeInUp" delay="0.5s">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-2 flex items-center">
                <img src="/cair.svg" alt="Car" className="w-10 h-10 mr-2" />
                Choose Your Car
              </h3>
              <p className="text-gray-800">
                Select from a range of vehicles for a comfortable and personalized learning experience.
              </p>
            </div>
          </AnimatedOnScroll>
          <AnimatedOnScroll animationClass="animate-fadeInUp" delay="0.6s">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-2 flex items-center">
                <img src="/star.svg" alt="Performance" className="w-10 h-10 mr-2" />
                Performance Tracking
              </h3>
              <p className="text-gray-800">
                Receive detailed progress reports so you always know where you stand.
              </p>
            </div>
          </AnimatedOnScroll>
          <AnimatedOnScroll animationClass="animate-fadeInUp" delay="0.7s">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-2 flex items-center">
                <img src="/calend.svg" alt="Schedule" className="w-10 h-10 mr-2" />
                Flexible Scheduling
              </h3>
              <p className="text-gray-800">
                Book lessons on your terms—whether weekdays or weekends, we accommodate your busy schedule.
              </p>
            </div>
          </AnimatedOnScroll>
          <AnimatedOnScroll animationClass="animate-fadeInUp" delay="0.8s">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-2 flex items-center">
                <img src="/local.svg" alt="Location" className="w-10 h-10 mr-2" />
                Live Location Tracking
              </h3>
              <p className="text-gray-800">
                Stay updated with real-time tracking of your instructor's location so you never miss a session.
              </p>
            </div>
          </AnimatedOnScroll>
          <AnimatedOnScroll animationClass="animate-fadeInUp" delay="0.9s">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-2 flex items-center">
                <img src="/workspace_premium.svg" alt="Certificate" className="w-10 h-10 mr-2" />
                Certified Instructors
              </h3>
              <p className="text-gray-800">
                Learn from rigorously vetted instructors who are committed to your success.
              </p>
            </div>
          </AnimatedOnScroll>
        </div>
      </section>

      {/* INSTRUCTOR SECTION (Infinite Marquee) */}
      <section className="py-16 px-6 md:px-20 bg-black">
        <h2 className="text-4xl font-bold text-center text-white mb-8">
          Meet the Instructors
        </h2>
        <div className="relative overflow-hidden">
          <div className="flex flex-nowrap gap-8 animate-marquee">
            {[...instructors, ...instructors].map((inst, index) => (
              <div
                key={index}
                className="w-80 aspect-square flex-shrink-0 p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                  <img
                    src={inst.image}
                    alt={inst.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mt-4 capitalize">
                  {inst.name}
                </h3>
                <p className="mt-2 text-gray-400">{inst.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BECOME AN INSTRUCTOR SECTION */}
      <section className="py-16 px-6 md:px-20 bg-green-100 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
          <h2 className="text-4xl font-bold text-black-900 mb-4">
            Want To Become An Instructor
          </h2>
          <p className="text-black-700 mb-6">
            Join our platform to grow your business while shaping the next generation of drivers.
            Enjoy flexible scheduling, reliable payments, and comprehensive support.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <img src="/ticktick.svg" alt="Check" className="w-5 h-5 mr-2 mt-1" />
              <span>Set your own schedule and pricing</span>
            </li>
            <li className="flex items-start">
              <img src="/ticktick.svg" alt="Check" className="w-5 h-5 mr-2 mt-1" />
              <span>Access to advanced student management tools</span>
            </li>
            <li className="flex items-start">
              <img src="/ticktick.svg" alt="Check" className="w-5 h-5 mr-2 mt-1" />
              <span>Secure and timely payments</span>
            </li>
            <li className="flex items-start">
              <img src="/ticktick.svg" alt="Check" className="w-5 h-5 mr-2 mt-1" />
              <span>Dedicated support team</span>
            </li>
          </ul>
        </div>
        <div className="md:w-1/2">
          {/* Apply to Join Card with Spotlight Effect */}
          <div className="bg-white p-6 shadow-[0_0_20px_5px_rgba(255,215,0,0.5)] rounded-lg max-w-md mx-auto w-full transition-transform transform hover:scale-105">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Apply to Join</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowModal(true);
              }}
            >
              <input
                type="text"
                placeholder="Full Name"
                className="w-full mb-4 p-3 border border-gray-300 rounded"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full mb-4 p-3 border border-gray-300 rounded"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full mb-4 p-3 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Driver's License Number"
                className="w-full mb-4 p-3 border border-gray-300 rounded"
              />
              <textarea
                placeholder="Tell us about your experience as a driving instructor"
                className="w-full mb-4 p-3 border border-gray-300 rounded"
                rows={4}
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Apply Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-900 text-white py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl font-bold">Driving School</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {["Features", "Pricing", "FAQ", "Privacy Policy", "Terms of Service"].map(
              (link, index) => (
                <a key={index} href="#" className="hover:text-white transition">
                  {link}
                </a>
              )
            )}
          </div>
          <div className="flex space-x-4 mt-6 md:mt-0">
            {["facebook", "twitter", "instagram"].map((icon, index) => (
              <a key={index} href="#" className="hover:text-white transition">
                <img src={`/${icon}.svg`} alt={icon} className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
        <div className="text-center text-sm mt-6">
          © 2025 Driving School. All rights reserved.
        </div>
      </footer>

      {/* MODAL OVERLAY */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-black p-8 rounded-lg shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              Choose
            </h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push("/signup");
                }}
                className="w-full py-4 bg-green-600 text-white rounded-md hover:bg-black text-xl"
              >
                Want to Learn
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push("/instructorSignup");
                }}
                className="w-full py-4 bg-blue-600 text-white rounded-md hover:bg-yellow-500 text-xl"
              >
                Want to Teach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
