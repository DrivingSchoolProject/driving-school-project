"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-white py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <h2 className="text-xl font-bold">Driving School</h2>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {["Features", "Pricing", "FAQ", "Privacy Policy", "Terms of Service"].map((link, index) => (
            <a key={index} href="#" className="hover:text-white transition">
              {link}
            </a>
          ))}
        </div>
        <div className="flex space-x-3">
          {["facebook", "twitter", "instagram"].map((icon, index) => (
            <a key={index} href="#" className="hover:text-white transition">
              <img src={`/${icon}.svg`} alt={icon} className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
      <div className="text-center text-xs mt-2">© 2025 Driving School. All rights reserved.</div>
    </footer>
  );
};

export default Footer;