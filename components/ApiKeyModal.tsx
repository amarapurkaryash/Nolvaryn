import React, { useState, useEffect } from 'react';

const API_KEY_SESSION_STORAGE_KEY = 'user_gemini_api_key';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateApiKey = (key: string): string | null => {
    if (!key.trim()) {
      return 'API key is required';
    }

    // Validate API key format (Gemini keys typically start with AIza)
    if (!key.startsWith('AIza') && key.length < 39) {
      return 'Invalid API key format. Please check your Gemini API key.';
    }

    return null;
  };

  useEffect(() => {
    if (isOpen) {
      const savedKey = sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
        setIsKeySaved(true);
      } else {
        setApiKey('');
        setIsKeySaved(false);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    setError(null);
    const validationError = validateApiKey(apiKey);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (apiKey.trim()) {
      sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, apiKey.trim());
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
      }, 1500);
    }
  };

  const handleClear = () => {
    sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
    setApiKey('');
    setIsKeySaved(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apiKeyModalTitle"
    >
      <div 
        className="bg-secondary-bg w-full max-w-lg m-4 p-6 rounded-lg border border-border-dark shadow-2xl shadow-accent-primary/10 animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="apiKeyModalTitle" className="text-2xl font-bold text-text-heading flex items-center">
            <span className="material-symbols-outlined mr-3 text-accent-primary">vpn_key</span>
            Manage API Key
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-border-dark text-text-muted-2"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <p className="text-text-muted-1 mb-4 leading-relaxed">
          To use Nolvaryn, you must provide your own Gemini API key. This is required for all analyses. Your key is only stored in your browser for this session.
        </p>
        
        <div className="mb-4">
          <label htmlFor="api-key-input" className="block text-sm font-medium text-text-muted-1 mb-1">
            Your Gemini API Key
          </label>
          <input
            id="api-key-input"
            type="password"
            value={apiKey}
            onChange={e => {
              setApiKey(e.target.value);
              setError(null);
            }}
            placeholder="Enter your Gemini API key"
            className={`w-full bg-primary-bg border rounded-md px-3 py-2 text-text-body focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none transition ${
              error ? 'border-red-500' : 'border-border-dark'
            }`}
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-4">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2">error</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {isKeySaved && !showSuccess && (
           <p className="text-sm text-green-400 mb-4 flex items-center">
             <span className="material-symbols-outlined text-base mr-1.5">check_circle</span>
             A key is currently saved for this session.
           </p>
        )}

        {showSuccess && (
            <p className="text-sm text-green-400 mb-4 flex items-center animate-fade-in">
              <span className="material-symbols-outlined text-base mr-1.5">check_circle</span>
              API key saved successfully for this session!
            </p>
        )}
        
        <div className="flex flex-row gap-3">
          <button 
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-accent-primary text-text-heading font-semibold rounded-md hover:bg-violet-600 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Save for Session
          </button>
          {isKeySaved && (
            <button 
              onClick={handleClear}
              className="flex-none flex items-center justify-center px-4 py-2 bg-red-600/80 text-text-heading font-semibold rounded-md hover:bg-red-600 transition-colors duration-300"
            >
               Clear Saved Key
            </button>
          )}
        </div>

        <p className="text-xs text-text-muted-2 mt-4 text-center">
          Don't have a key? Get a free one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-secondary hover:underline">Google AI Studio</a>.
        </p>
      </div>
    </div>
  );
};