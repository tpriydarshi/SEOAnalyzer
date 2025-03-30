interface MetaTag {
    name?: string;
    property?: string;
    content: string;
}

export interface SeoAnalysisResult {
    title: string;
    description: string;
    metaTags: MetaTag[];
    openGraph: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
    };
    twitter: {
        card?: string;
        title?: string;
        description?: string;
        image?: string;
    };
    canonical?: string;
    favicon?: string;
    issues: {
        severity: 'error' | 'warning' | 'info';
        message: string;
    }[];
}

export async function analyzeSEO(url: string): Promise<SeoAnalysisResult> {
    try {
        // Fetch the HTML content
        const response = await fetch(`/api/fetch-site?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch URL');
        }
        const html = await response.text();

        // Create a temporary element to parse HTML
        const doc = document.createElement('div');
        doc.innerHTML = html;

        const result: SeoAnalysisResult = {
            title: '',
            description: '',
            metaTags: [],
            openGraph: {},
            twitter: {},
            issues: [],
        };

        // Get basic meta information
        const titleTag = doc.querySelector('title');
        result.title = titleTag?.textContent || '';
        const descriptionTag = doc.querySelector('meta[name="description"]');
        result.description = descriptionTag?.getAttribute('content') || '';

        // Get all meta tags
        const metaTags = doc.getElementsByTagName('meta');
        Array.from(metaTags).forEach(tag => {
            const name = tag.getAttribute('name') || undefined;
            const property = tag.getAttribute('property') || undefined;
            const content = tag.getAttribute('content') || undefined;

            if (content) {
                result.metaTags.push({ name, property, content });

                // Parse OpenGraph tags
                if (property?.startsWith('og:')) {
                    const key = property.replace('og:', '') as keyof typeof result.openGraph;
                    result.openGraph[key] = content;
                }

                // Parse Twitter tags
                if (name?.startsWith('twitter:')) {
                    const key = name.replace('twitter:', '') as keyof typeof result.twitter;
                    result.twitter[key] = content;
                }
            }
        });

        // Get canonical link
        const canonical = doc.querySelector('link[rel="canonical"]');
        result.canonical = canonical?.getAttribute('href') || undefined;

        // Get favicon
        const favicon = doc.querySelector('link[rel="icon"]') || doc.querySelector('link[rel="shortcut icon"]');
        result.favicon = favicon?.getAttribute('href') || undefined;

        // Analyze issues
        analyzeIssues(result);

        return result;
    } catch (error) {
        throw new Error(`Failed to analyze SEO: ${error}`);
    }
}

function analyzeIssues(result: SeoAnalysisResult): void {
    // Title checks
    if (!result.title) {
        result.issues.push({
            severity: 'error',
            message: 'Missing page title'
        });
    } else if (result.title.length < 30 || result.title.length > 60) {
        result.issues.push({
            severity: 'warning',
            message: `Title length (${result.title.length} characters) should be between 30-60 characters`
        });
    }

    // Description checks
    if (!result.description) {
        result.issues.push({
            severity: 'error',
            message: 'Missing meta description'
        });
    } else if (result.description.length < 120 || result.description.length > 160) {
        result.issues.push({
            severity: 'warning',
            message: `Description length (${result.description.length} characters) should be between 120-160 characters`
        });
    }

    // OpenGraph checks
    if (!result.openGraph.title || !result.openGraph.description || !result.openGraph.image) {
        result.issues.push({
            severity: 'warning',
            message: 'Missing OpenGraph tags (og:title, og:description, or og:image)'
        });
    }

    // Twitter card checks
    if (!result.twitter.card || !result.twitter.title || !result.twitter.description) {
        result.issues.push({
            severity: 'warning',
            message: 'Missing Twitter card tags'
        });
    }

    // Canonical check
    if (!result.canonical) {
        result.issues.push({
            severity: 'warning',
            message: 'Missing canonical URL tag'
        });
    }
} 