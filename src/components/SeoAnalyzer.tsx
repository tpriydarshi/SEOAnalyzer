'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import type { SeoAnalysisResult } from '@/types/seo';

export default function SeoAnalyzer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SeoAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isValidUrl = (urlString: string): boolean => {
        // First try parsing with the URL as-is
        try {
            const url = new URL(urlString);
            const protocol = url.protocol.toLowerCase();
            // If URL has a protocol, ensure it's http or https
            if (protocol !== 'http:' && protocol !== 'https:') {
                return false;
            }
            return true;
        } catch {
            // If parsing fails, try with both http:// and https:// prefixes
            try {
                // Try https:// first
                new URL(`https://${urlString}`);
                return true;
            } catch {
                try {
                    // Then try http:// if https:// fails
                    new URL(`http://${urlString}`);
                    return true;
                } catch {
                    return false;
                }
            }
        }
    };

    const normalizeUrl = (urlString: string): string => {
        try {
            // First try parsing the URL as-is
            const url = new URL(urlString);
            const protocol = url.protocol.toLowerCase();

            // If URL has a non-http(s) protocol, throw error
            if (protocol !== 'http:' && protocol !== 'https:') {
                throw new Error('Invalid protocol');
            }
            return url.href;
        } catch {
            // If no protocol specified, try with https:// first
            try {
                const urlWithHttps = new URL(`https://${urlString}`);
                return urlWithHttps.href;
            } catch {
                // If https:// fails, try with http://
                try {
                    const urlWithHttp = new URL(`http://${urlString}`);
                    return urlWithHttp.href;
                } catch {
                    throw new Error('Invalid URL format');
                }
            }
        }
    };

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setUrl(value);
    };

    const handleAnalyze = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!isValidUrl(url)) {
                throw new Error('Please enter a valid domain name or URL');
            }

            const normalizedUrl = normalizeUrl(url);
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: normalizedUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to analyze URL');
            }

            const result = await response.json();
            setResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze URL');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
        switch (severity) {
            case 'error':
                return 'bg-red-100 text-red-700';
            case 'warning':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const calculateScore = (result: SeoAnalysisResult): number => {
        let score = 100;
        const errors = result.issues.filter(i => i.severity === 'error').length;
        const warnings = result.issues.filter(i => i.severity === 'warning').length;

        score -= (errors * 20); // -20 points for each error
        score -= (warnings * 10); // -10 points for each warning

        return Math.max(0, score); // Don't go below 0
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <form onSubmit={handleAnalyze} className="mb-8">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="url"
                            value={url}
                            onChange={handleUrlChange}
                            placeholder="example.com or https://example.com"
                            className="flex-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {url && !isValidUrl(url) && (
                    <p className="mt-2 text-sm text-red-600">
                        Please enter a valid domain name (e.g., example.com) or full URL (e.g., https://example.com)
                    </p>
                )}
            </form>

            {error && (
                <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-8">
                    {/* SEO Score */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">SEO Score</h2>
                        <div className="flex items-center justify-center">
                            <div className={`text-6xl font-bold ${getScoreColor(calculateScore(result))}`}>
                                {calculateScore(result)}
                            </div>
                            <div className="text-2xl ml-2">/100</div>
                        </div>
                    </section>

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
                            {result.issues.map((issue, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}
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