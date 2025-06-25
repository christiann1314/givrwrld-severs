
import React from 'react';

const Footer = () => {
  const footerSections = [
    {
      title: "Hosting",
      links: [
        "Minecraft Hosting",
        "FiveM Hosting", 
        "Palworld Hosting"
      ]
    },
    {
      title: "Company",
      links: [
        "About Us",
        "Blog",
        "Affiliate Program",
        "Contact"
      ]
    },
    {
      title: "Support", 
      links: [
        "Help Center",
        "Discord Server",
        "Status Page",
        "FAQ"
      ]
    },
    {
      title: "Legal",
      links: [
        "Terms of Service",
        "Privacy Policy", 
        "SLA",
        "Refund Policy"
      ]
    }
  ];

  return (
    <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700/50 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 GIVRwrld Servers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
