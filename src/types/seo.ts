export interface SocialMediaMeta {
    title?: string;
    description?: string;
    image?: string;
}

export interface SeoIssue {
    severity: 'error' | 'warning' | 'info';
    message: string;
}

export interface SeoAnalysisResult {
    title: string;
    description: string;
    canonical?: string;
    openGraph: SocialMediaMeta;
    twitter: SocialMediaMeta;
    issues: SeoIssue[];
} 