'use client';

import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Loader } from './components/Loader';
import { About } from './components/About';
import { Features } from './components/Features';
import { HowToUse } from './components/HowToUse';
import { FAQ } from './components/FAQ';
import { Legal } from './components/Legal';
import { Home } from './components/Home';
import { ApiKeyModal } from './components/ApiKeyModal';
import { analyzeEmail } from './services/analyzeApi';
import { AnalysisResult } from './types';
import { showSuccessToast } from './services/pdfService';

type AppState = 'upload' | 'analyzing' | 'result' | 'error';
type Page = 'home' | 'about' | 'features' | 'how-to-use' | 'faq' | 'legal';
export type HomeView = 'landing' | 'uploader';


const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [appState, setAppState] = useState<AppState>('upload');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [homeView, setHomeView] = useState<HomeView>('landing');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileUpload = useCallback(async (emlFile: File) => {
    const userApiKey = sessionStorage.getItem('user_gemini_api_key');
    if (!userApiKey) {
        setPendingFile(emlFile);
        setIsApiKeyModalOpen(true);
        return;
    }

    if (!emlFile || !emlFile.name.endsWith('.eml')) {
        setErrorMessage('Invalid file type. Please upload a .eml file.');
        setAppState('error');
        return;
    }
    setAppState('analyzing');
    setAnalysisStep('Initializing analysis...');
    setErrorMessage('');
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target?.result as string;
        if (fileContent) {
          try {
            setAnalysisStep('Uploading file for analysis...');
            const finalResult = await analyzeEmail(fileContent, userApiKey);
            setAnalysisResult(finalResult);
            setAppState('result');
          } catch (err) {
            console.error('Analysis failed:', err);
            const error = err as Error;
            setErrorMessage(error.message || 'Failed to analyze the email. The content may be invalid or the service is unavailable.');
            setAppState('error');
          }
        } else {
            throw new Error("File content is empty.");
        }
      };
      reader.onerror = () => {
        throw new Error("Failed to read the file.");
      }
      reader.readAsText(emlFile);
    } catch (err) {
      console.error('File processing error:', err);
      const error = err as Error;
      setErrorMessage(error.message || 'An unknown error occurred during file processing.');
      setAppState('error');
    }
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
    setAppState('upload');
    setErrorMessage('');
    setPendingFile(null);
    setHomeView('landing');
    setCurrentPage('home');
  };

  const handleNavigate = (page: Page, options?: { view?: HomeView; reset?: boolean }) => {
    if (options?.reset) {
      handleReset();
      return;
    }

    setCurrentPage(page);

    if (page === 'home' && options?.view) {
      // Only switch to the uploader view if we are not currently in the middle of an analysis or showing a result.
      // If we are, just switching back to the 'home' page is enough to show the current state.
      if (appState === 'upload') {
        setHomeView(options.view);
      }
    }
  };

  const handleApiKeySaved = () => {
    setIsApiKeyModalOpen(false);
    if (pendingFile) {
      const fileToProcess = pendingFile;
      setPendingFile(null);
      handleFileUpload(fileToProcess);
    }
  };

  const handleModalClose = () => {
    setIsApiKeyModalOpen(false);
    setPendingFile(null);
  };



  const renderHomePage = () => {
    switch (appState) {
      case 'analyzing':
        return <Loader message={analysisStep} />;
        case 'result':
        if (analysisResult) {
          // Show success toast with analysis time
          if (analysisResult.analysisTime) {
            showSuccessToast(analysisResult.analysisTime);
          }
          return <AnalysisResultDisplay result={analysisResult} onReset={handleReset} />;
        }
        return null;
      case 'error':
        return (
          <div className="text-center p-8 bg-secondary-bg border border-red-500/30 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
            <p className="text-text-muted-1 mb-6 max-w-2xl mx-auto">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-accent-primary text-text-heading font-semibold rounded-md hover:bg-violet-600 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        );
      case 'upload':
      default:
        if (homeView === 'landing') {
          return <Home onAnalyzeClick={() => setHomeView('uploader')} />;
        }
        return <FileUpload onFileUpload={handleFileUpload} />;
    }
  };


  const renderPage = () => {
    switch (currentPage) {
        case 'features':
            return <Features />;
        case 'how-to-use':
            return <HowToUse />;
        case 'faq':
            return <FAQ />;
        case 'legal':
            return <Legal />;
        case 'about':
            return <About />;
        case 'home':
        default:
           return renderHomePage();
    }
  };

  const isAnalyzerActive = currentPage === 'home' && (homeView === 'uploader' || appState !== 'upload');

  return (
    <div className="min-h-screen bg-primary-bg text-text-body font-sans">
      <Navbar 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        isAnalyzerActive={isAnalyzerActive} 
        onApiKeyClick={() => setIsApiKeyModalOpen(true)}
      />
      <main className="container mx-auto px-8 pb-8 pt-16 lg:px-12 xl:px-16">
        <div className="max-w-screen-2xl lg:max-w-7xl xl:max-w-screen-2xl mx-auto">
          {renderPage()}
        </div>
      </main>
      <footer className="text-center py-6 text-text-muted-2 text-base lg:text-lg">
        <p>Email Security Platform | Optimized for Desktop & Large Screens</p>
        <p className="text-sm text-text-muted-2 mt-2">Made with Nolvaryn | Powered by Gemini AI</p>
      </footer>
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={handleModalClose} 
        onSave={handleApiKeySaved} 
      />
    </div>
  );
};

export default App;
