"use client";

import { useState } from "react";

export default function URLInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError("");
    setWebsiteName("");

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to scrape the URL.");
      }

      const data = await response.json();
      setWebsiteName(data.websiteName || "Website scraped successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
            />
          </svg>
          Tell us about yourself
        </h2>
        <p className="text-indigo-100 mt-1 text-sm">
          Share your LinkedIn, Website, GitHub, or other profiles
        </p>
      </div>

      {/* Input area */}
      <div className="px-6 py-6">
        <div 
          className={`flex items-center rounded-lg border ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'} overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all`}
        >
          <span className="pl-4 text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
              />
            </svg>
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your profile URL..."
            className={`flex-grow py-3 px-3 outline-none bg-transparent text-gray-700 placeholder-gray-400`}
          />
          <button
            onClick={handleScrape}
            disabled={loading}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`px-5 py-3 font-medium text-white transition-all duration-300 ${loading ? "bg-gray-400" : isHovered ? "bg-indigo-700" : "bg-indigo-600"}`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing
              </div>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center text-red-600 text-sm">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            {error}
          </div>
        )}
        
        {/* Success message */}
        {websiteName && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-green-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  <strong>{websiteName}</strong> has been analyzed successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supported sites examples */}
        <div className="mt-6">
          <p className="text-xs text-gray-500 mb-2">Supported platforms:</p>
          <div className="flex flex-wrap gap-2">
            {['LinkedIn', 'GitHub', 'Twitter', 'Portfolio', 'Medium'].map((site) => (
              <span 
                key={site} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {site}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}