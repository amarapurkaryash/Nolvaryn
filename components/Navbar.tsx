import React from 'react';
import { GithubIcon, LinkedInIcon } from './Icons';
import { HomeView } from '../App';

type Page = 'home' | 'about' | 'features' | 'how-to-use' | 'faq' | 'legal';

interface NavbarProps {
  onNavigate: (page: Page, options?: { view?: HomeView; reset?: boolean }) => void;
  currentPage: Page;
  isAnalyzerActive: boolean;
  onApiKeyClick: () => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`bg-secondary-bg/80 backdrop-blur-sm border rounded-full shadow-lg flex items-center transition-all duration-300 px-3 py-1.5 text-sm font-medium ${
      isActive
        ? 'border-accent-primary/50 text-text-heading shadow-accent-primary/20'
        : 'border-border-dark text-text-muted-1 hover:text-text-heading hover:shadow-accent-primary/20 hover:border-accent-primary/30'
    }`}
  >
    {children}
  </button>
);

const IconLink: React.FC<{ href: string; children: React.ReactNode; title: string }> = ({ href, children, title }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    className="bg-secondary-bg/80 backdrop-blur-sm border border-border-dark rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-accent-primary/20 hover:border-accent-primary/30 w-10 h-10 text-text-muted-2 hover:text-text-heading"
  >
    {children}
  </a>
);

const NavIconButton: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode; 
  title: string; 
  className?: string; 
}> = ({ onClick, children, title, className = '' }) => (
  <button
    onClick={onClick}
    title={title}
    className={`bg-secondary-bg/80 backdrop-blur-sm border border-border-dark rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-accent-primary/20 hover:border-accent-primary/30 w-10 h-10 text-text-muted-2 hover:text-text-heading ${className}`}
  >
    {children}
  </button>
);

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, isAnalyzerActive, onApiKeyClick }) => {
  return (
    <div className="sticky top-4 z-50 px-4 animate-fade-in-down">
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* App Name / Logo */}
          <button onClick={() => onNavigate('home', { reset: true })} className="bg-secondary-bg/80 backdrop-blur-sm border border-border-dark rounded-full shadow-lg flex items-center transition-all duration-300 hover:shadow-accent-primary/20 hover:border-accent-primary/30 text-xl font-bold text-text-heading px-5 py-2">
              Nolvaryn
          </button>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <NavButton onClick={() => onNavigate('home', { view: 'uploader' })} isActive={isAnalyzerActive}>
              Analyzer
            </NavButton>
            <NavButton onClick={() => onNavigate('features')} isActive={currentPage === 'features'}>
              Features
            </NavButton>
            <NavButton onClick={() => onNavigate('how-to-use')} isActive={currentPage === 'how-to-use'}>
              How To Use
            </NavButton>
            <NavButton onClick={() => onNavigate('faq')} isActive={currentPage === 'faq'}>
              FAQ
            </NavButton>
            <NavButton onClick={() => onNavigate('about')} isActive={currentPage === 'about'}>
              About
            </NavButton>
             <NavButton onClick={() => onNavigate('legal')} isActive={currentPage === 'legal'}>
              Privacy Policy
            </NavButton>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            <NavIconButton onClick={onApiKeyClick} title="Set API Key">
              <span className="material-symbols-outlined">vpn_key</span>
            </NavIconButton>
            <IconLink href="https://github.com/amarapurkaryash/Nolvaryn" title="GitHub">
              <GithubIcon className="w-6 h-6 fill-current" />
            </IconLink>
            <IconLink href="https://www.linkedin.com/in/amarapurkaryash" title="LinkedIn">
               <LinkedInIcon className="w-6 h-6 fill-current" />
            </IconLink>
          </div>
        </nav>
    </div>
  );
};