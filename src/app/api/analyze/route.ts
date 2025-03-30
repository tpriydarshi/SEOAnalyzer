import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import type { SeoAnalysisResult } from '@/types/seo';

const isValidUrl = (urlString: string): boolean => {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        if (!isValidUrl(url)) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SEOAnalyzer/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const result: SeoAnalysisResult = {
            title: doc.title || '',
            description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
            openGraph: {
                title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || undefined,
                description: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || undefined,
                image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined,
            },
            twitter: {
                title: doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || undefined,
                description: doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || undefined,
                image: doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || undefined,
            },
            canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || undefined,
            issues: []
        };

        // Check if we were redirected to HTTPS
        const finalUrl = response.url;
        if (url.startsWith('http://') && finalUrl.startsWith('https://')) {
            result.issues.push({
                severity: 'warning',
                message: 'Site redirects to HTTPS. Consider updating links to use HTTPS directly.'
            });
        }

        // Analyze issues
        if (!result.title) {
            result.issues.push({ severity: 'error', message: 'Missing page title' });
        } else if (result.title.length < 30 || result.title.length > 60) {
            result.issues.push({
                severity: 'warning',
                message: `Title length (${result.title.length} characters) should be between 30-60 characters`
            });
        }

        if (!result.description) {
            result.issues.push({ severity: 'error', message: 'Missing meta description' });
        } else if (result.description.length < 120 || result.description.length > 160) {
            result.issues.push({
                severity: 'warning',
                message: `Description length (${result.description.length} characters) should be between 120-160 characters`
            });
        }

        if (!result.openGraph.title || !result.openGraph.description || !result.openGraph.image) {
            result.issues.push({
                severity: 'warning',
                message: 'Missing OpenGraph tags (og:title, og:description, or og:image)'
            });
        }

        if (!result.twitter.title || !result.twitter.description || !result.twitter.image) {
            result.issues.push({
                severity: 'warning',
                message: 'Missing Twitter card tags'
            });
        }

        if (!result.canonical) {
            result.issues.push({
                severity: 'warning',
                message: 'Missing canonical URL tag'
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze URL' },
            { status: 500 }
        );
    }
} 