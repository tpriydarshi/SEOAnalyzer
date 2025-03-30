# SEO Analyzer

A modern web application that analyzes websites for SEO best practices and provides visual feedback on meta tags implementation.

## Features

- Analyze any website's SEO meta tags
- Visual preview of social media sharing cards (Facebook/Twitter)
- Detailed analysis of:
  - Meta title and description
  - OpenGraph tags
  - Twitter Card tags
  - Canonical URLs
  - Favicon detection
- SEO recommendations with severity levels
- Modern, responsive UI built with Next.js and Tailwind CSS

## Tech Stack

- [Next.js 13](https://nextjs.org/) - React framework with App Router
- [React 18](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- Server-side HTML parsing for reliable meta tag extraction

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/seo-analyzer.git
cd seo-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. Enter any website URL in the input field
2. Click "Analyze" to fetch and analyze the site's SEO tags
3. View the comprehensive analysis including:
   - Basic SEO information
   - Social media previews
   - Issues and recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 