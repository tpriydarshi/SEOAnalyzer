'use client';

import React from 'react';
import SeoAnalyzer from '../components/SeoAnalyzer';

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold text-center mb-8">SEO Analyzer</h1>
                <p className="text-center text-gray-600 mb-8">
                    Enter any website URL to analyze its SEO meta tags and get recommendations
                </p>
                <SeoAnalyzer />
            </div>
        </main>
    );
} 