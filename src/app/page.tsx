"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import NoSSR from '../components/NoSSR';

interface MarkdownComponentProps {
    children?: React.ReactNode;
    className?: string;
    inline?: boolean;
}

export default function Home() {
    const [readmeText, setReadmeText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    // Fix hydration mismatch by ensuring client-side only rendering
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const generatePDF = useCallback(async () => {
        if (!readmeText.trim()) {
            setError("Please enter some text to convert");
            return;
        }

        if (!previewRef.current) {
            setError("Preview not ready, please try again");
            return;
        }

        setIsGenerating(true);
        setError(null);
        
        try {
            // Capture the live preview as an image
            const canvas = await html2canvas(previewRef.current, {
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: previewRef.current.scrollWidth,
                height: previewRef.current.scrollHeight,
                scrollX: 0,
                scrollY: 0
            });

            // Create PDF with the captured image
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            const margin = 0;

            let position = margin;

            // Add the first page
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Download the PDF directly
            pdf.save('README.pdf');
            
        } catch (err) {
            console.error('PDF generation error:', err);
            setError(err instanceof Error ? err.message : "Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    }, [readmeText]);

    const clearText = useCallback(() => {
        setReadmeText("");
        setError(null);
    }, []);

    const loadSampleMarkdown = useCallback(() => {
        const sampleText = `# 🚀 MarkdownPDF - Professional Document Generator

## 📊 Dashboard Overview

Transform your **markdown content** into _stunning PDFs_ with our advanced conversion engine.

### ✨ Premium Features

- 🎯 **Real-time WYSIWYG Preview** - See your content exactly as it will appear
- 🎨 **Modern Glass Morphism UI** - Beautiful, cutting-edge interface design  
- 🚀 **Instant PDF Generation** - One-click conversion with perfect fidelity
- � **Advanced Code Highlighting** - Syntax highlighting for 100+ languages
- 📊 **Beautiful Tables** - Professional table styling with hover effects
- � **Gradient Typography** - Eye-catching text effects throughout
- ⚡ **Micro-interactions** - Smooth animations and delightful user experience

### � Code Showcase

Experience our advanced syntax highlighting:

\`\`\`javascript
// Modern async/await pattern
const generatePDF = async (markdown) => {
  const canvas = await html2canvas(previewRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });
  
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  pdf.save('document.pdf');
};
\`\`\`

\`\`\`python
# Python data processing example
import pandas as pd
import numpy as np

def process_data(df):
    """Process dataframe with modern styling."""
    return df.groupby('category').agg({
        'value': ['mean', 'std', 'count']
    }).round(2)

# Execute with beautiful results
result = process_data(sample_data)
print(f"Processing complete: {result.shape}")
\`\`\`

### � Feature Comparison Table

| Feature | Basic Editor | **MarkdownPDF** | Premium Tools |
|---------|-------------|-----------------|---------------|
| Real-time Preview | ❌ | ✅ **Instant** | ✅ |
| Modern UI | ❌ | ✅ **Glass Design** | ⚠️ |
| PDF Quality | ⚠️ Basic | ✅ **Perfect** | ✅ |
| Code Highlighting | ❌ | ✅ **Advanced** | ✅ |
| Micro-interactions | ❌ | ✅ **Smooth** | ⚠️ |
| Price | Free | ✅ **Free** | 💰 $$$$ |

### 🎯 Advanced Typography

> **"The future of document creation is here"** - This blockquote showcases our beautiful gradient styling and modern typography that makes your content stand out from the crowd.

Here's some \`inline code\` that demonstrates our **bold gradient text** and _beautiful italic styling_ that works seamlessly with our modern design system.

### 🌐 External Resources

- [Next.js Documentation](https://nextjs.org/docs) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [jsPDF Library](https://github.com/parallax/jsPDF) - PDF generation

### 🚀 Getting Started

1. **Write** your markdown in the left editor panel
2. **Preview** your content in real-time on the right panel  
3. **Generate** your PDF with a single click
4. **Download** your beautifully formatted document

---

**✨ Created with ❤️ using modern web technologies**

*Transform your ideas into stunning documents today!*`;
        setReadmeText(sampleText);
        setError(null);
    }, []);

    const markdownComponents = useMemo(() => ({
        code({ inline, className, children, ...props }: MarkdownComponentProps & { inline?: boolean }) {
            const match = /language-(\w+)/.exec(className || '');
            
            return !inline && match ? (
                <NoSSR 
                    fallback={
                        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto shadow-lg border border-gray-200">
                            <code className="text-sm font-mono">{children}</code>
                        </pre>
                    }
                >
                    <div className="relative my-6">
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-xl !mt-0 shadow-lg border border-gray-200"
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    </div>
                </NoSSR>
            ) : (
                <code className={`${className} bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md text-sm font-medium border border-emerald-200`} {...props}>
                    {children}
                </code>
            );
        },
        table: ({ children }: MarkdownComponentProps) => (
            <div className="overflow-x-auto my-8">
                <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    {children}
                </table>
            </div>
        ),
        th: ({ children }: MarkdownComponentProps) => (
            <th className="bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                {children}
            </th>
        ),
        td: ({ children }: MarkdownComponentProps) => (
            <td className="px-6 py-4 border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                {children}
            </td>
        ),
        blockquote: ({ children }: MarkdownComponentProps) => (
            <blockquote className="border-l-4 border-emerald-500 pl-6 py-4 my-6 bg-emerald-50 rounded-r-lg shadow-sm">
                <div className="text-gray-700 italic">
                    {children}
                </div>
            </blockquote>
        ),
        h1: ({ children }: MarkdownComponentProps) => (
            <h1 className="text-3xl font-bold mt-8 mb-6 text-gray-900 border-b-2 border-emerald-500 pb-3">
                {children}
            </h1>
        ),
        h2: ({ children }: MarkdownComponentProps) => (
            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">
                {children}
            </h2>
        ),
        h3: ({ children }: MarkdownComponentProps) => (
            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">
                {children}
            </h3>
        ),
        p: ({ children }: MarkdownComponentProps) => (
            <p className="mb-4 leading-relaxed text-gray-700">
                {children}
            </p>
        ),
        ul: ({ children }: MarkdownComponentProps) => (
            <ul className="list-none mb-6 space-y-2 text-gray-700">
                {children}
            </ul>
        ),
        ol: ({ children }: MarkdownComponentProps) => (
            <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-700 ml-4">
                {children}
            </ol>
        ),
        li: ({ children }: MarkdownComponentProps) => (
            <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2.5 flex-shrink-0"></span>
                <span className="flex-1">{children}</span>
            </li>
        ),
        a: ({ children, href }: MarkdownComponentProps & { href?: string }) => (
            <a 
                href={href} 
                className="text-emerald-600 hover:text-emerald-700 font-medium underline decoration-emerald-300 hover:decoration-emerald-400 underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        ),
        strong: ({ children }: MarkdownComponentProps) => (
            <strong className="font-semibold text-gray-900">
                {children}
            </strong>
        ),
        em: ({ children }: MarkdownComponentProps) => (
            <em className="italic text-gray-800">
                {children}
            </em>
        ),
    }), []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Top Navigation Bar */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-white">MarkdownPDF</span>
                            </div>
                        </div>

                        {/* Top Navigation Pills */}
                        <div className="hidden md:flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
                            <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-md hover:bg-gray-600 transition-colors">
                                Editor
                            </button>
                            <button className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-md">
                                Preview
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-md hover:bg-gray-600 transition-colors">
                                Export
                            </button>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-300 pr-2">Live</span>
                            </div>
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">U</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center">
                                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Tools
                            </h2>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700 rounded-lg p-4 card-hover smooth-transition">
                                <div className="text-2xl font-bold text-emerald-400">{readmeText.length}</div>
                                <div className="text-xs text-gray-400">Characters</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4 card-hover smooth-transition">
                                <div className="text-2xl font-bold text-blue-400">{readmeText.split('\n').length}</div>
                                <div className="text-xs text-gray-400">Lines</div>
                            </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4 card-hover smooth-transition">
                            <div className="text-2xl font-bold text-purple-400">{readmeText.split(' ').filter(word => word.length > 0).length}</div>
                            <div className="text-xs text-gray-400">Words</div>
                        </div>
                    </div>

                    {/* Action Categories */}
                    <div className="flex-1 px-6 pb-6">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Actions</div>
                            
                            <button
                                onClick={loadSampleMarkdown}
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors group card-hover"
                            >
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-400 transition-colors glow-emerald">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium">Load Sample</div>
                                    <div className="text-xs text-gray-500">Example content</div>
                                </div>
                            </button>

                            <button
                                onClick={clearText}
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors group card-hover"
                            >
                                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-400 transition-colors">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium">Clear All</div>
                                    <div className="text-xs text-gray-500">Reset editor</div>
                                </div>
                            </button>

                            <button
                                onClick={generatePDF}
                                disabled={isGenerating || !readmeText.trim()}
                                className="w-full flex items-center px-4 py-3 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors group btn-primary"
                            >
                                <div className="w-8 h-8 bg-emerald-600 group-hover:bg-emerald-500 disabled:bg-gray-500 rounded-lg flex items-center justify-center mr-3 transition-colors">
                                    {isGenerating ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium">{isGenerating ? 'Generating...' : 'Export PDF'}</div>
                                    <div className="text-xs text-emerald-200">{isGenerating ? 'Please wait' : 'Download ready'}</div>
                                </div>
                            </button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-300">Document Status</span>
                                <span className="text-sm text-emerald-400">Ready</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                                <div className={`h-2 rounded-full transition-all duration-300 ${readmeText.trim() ? 'bg-emerald-400' : 'bg-gray-500'}`} style={{ width: readmeText.trim() ? '100%' : '0%' }}></div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                {readmeText.trim() ? 'Ready to export' : 'Start typing to begin'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex">
                    {/* Editor Panel */}
                    <div className="flex-1 flex flex-col bg-gray-850">
                        {/* Editor Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white">Markdown Editor</h3>
                                    <p className="text-xs text-gray-400">Write your content</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                                    Markdown
                                </div>
                                <div className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                                    Auto-save
                                </div>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 p-6">
                            <textarea
                                className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 placeholder-gray-500 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent smooth-transition custom-scrollbar"
                                placeholder="# Start writing your markdown here...

## Features
- Real-time preview
- Professional export
- Modern interface

Write something amazing! ✨"
                                value={readmeText}
                                onChange={(e) => setReadmeText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="flex-1 flex flex-col bg-white border-l border-gray-700">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
                                    <p className="text-xs text-gray-500">WYSIWYG output</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 rounded-full">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-emerald-700 font-medium">Live</span>
                                </div>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                            {error && (
                                <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 text-red-400 mr-2">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-red-800">Error</h4>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-8" ref={previewRef}>
                                {readmeText.trim() ? (
                                    <div className="prose prose-lg max-w-none prose-enhanced">
                                        {isMounted ? (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={markdownComponents}
                                            >
                                                {readmeText}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="h-8 bg-gray-200 rounded w-3/4 loading-shimmer"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2 loading-shimmer"></div>
                                                <div className="h-4 bg-gray-200 rounded w-5/6 loading-shimmer"></div>
                                                <div className="h-32 bg-gray-200 rounded loading-shimmer"></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 glow-emerald">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Writing</h3>
                                        <p className="text-gray-600 mb-4">Your markdown will appear here as you type</p>
                                        <div className="px-4 py-2 bg-emerald-50 rounded-lg text-emerald-700 text-sm font-medium">
                                            💡 Try loading a sample to get started
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
