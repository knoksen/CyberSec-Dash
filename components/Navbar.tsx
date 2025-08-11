
import React, { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '#agents', label: 'Agents' },
    { href: '#chat', label: 'Chat' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <a href="#" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
          <Shield className="text-blue-600" />
          <span>Cyber Agents</span>
        </a>
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              {link.label}
            </a>
          ))}
        </nav>
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden p-4 space-y-2">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="block text-gray-600 hover:text-blue-600 transition-colors font-medium p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
