import { SeoAnalysisResult } from '@/types/seo';

export async function analyzeSEO(url: string): Promise<SeoAnalysisResult> {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze URL');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to analyze URL');
    }
} 