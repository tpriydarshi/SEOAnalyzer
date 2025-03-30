'use client';

import React, { useState } from 'react';
import { analyzeSEO } from '../utils/seoAnalyzer';
import type { SeoAnalysisResult } from '../utils/seoAnalyzer';

export default function SeoAnalyzer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SeoAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await analyzeSEO(url);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <form onSubmit={handleAnalyze} className="mb-8">
                <div className="flex gap-4">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter website URL"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-8">
                    {/* Basic SEO Info */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Basic SEO Information</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">Title</h3>
                                <p className="mt-1">{result.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Description</h3>
                                <p className="mt-1">{result.description}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Canonical URL</h3>
                                <p className="mt-1">{result.canonical || 'Not specified'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Social Media Preview */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Social Media Preview</h2>

                        {/* OpenGraph Preview */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Facebook/OpenGraph Preview</h3>
                            <div className="border rounded-lg p-4">
                                <img
                                    src={result.openGraph.image || '/placeholder-image.png'}
                                    alt="OG Preview"
                                    className="w-full h-48 object-cover rounded mb-3"
                                />
                                <h4 className="font-bold">{result.openGraph.title || result.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">
                                    {result.openGraph.description || result.description}
                                </p>
                                <p className="text-gray-500 text-sm mt-2">{url}</p>
                            </div>
                        </div>

                        {/* Twitter Preview */}
                        <div>
                            <h3 className="font-medium mb-3">Twitter Card Preview</h3>
                            <div className="border rounded-lg p-4">
                                <img
                                    src={result.twitter.image || result.openGraph.image || '/placeholder-image.png'}
                                    alt="Twitter Preview"
                                    className="w-full h-48 object-cover rounded mb-3"
                                />
                                <h4 className="font-bold">{result.twitter.title || result.openGraph.title || result.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">
                                    {result.twitter.description || result.openGraph.description || result.description}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Issues and Recommendations */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Issues and Recommendations</h2>
                        <div className="space-y-3">
                            {result.issues.map((issue: any, index: number) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${issue.severity === 'error'
                                        ? 'bg-red-100 text-red-700'
                                        : issue.severity === 'warning'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}
                                >
                                    {issue.message}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
} 