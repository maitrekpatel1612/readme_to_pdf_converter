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
    const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage width
    const [isDragging, setIsDragging] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Handle draggable separator
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            
            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            
            // Constrain between 20% and 80%
            const constrainedWidth = Math.min(80, Math.max(20, newLeftWidth));
            setLeftPanelWidth(constrainedWidth);
        };
        
        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, []);

    const generateDocument = useCallback(async () => {
        if (!readmeText.trim()) {
            setError("Please enter some text to convert");
            return;
        }

        setIsGeneratingDoc(true);
        setError(null);
        
        try {
            const response = await fetch('/api/generate-doc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    content: readmeText,
                    title: 'README Document'
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'README.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (err) {
            console.error('Document generation error:', err);
            setError(err instanceof Error ? err.message : "Failed to generate document");
        } finally {
            setIsGeneratingDoc(false);
        }
    }, [readmeText]);

    const clearText = useCallback(() => {
        setReadmeText("");
        setError(null);
    }, []);

    const loadSampleMarkdown = useCallback(() => {
        const sampleText = `# 🚀 PDFMyReadme - Professional Document Generator

## 📊 Dashboard Overview

Transform your **markdown content** into _stunning PDFs and documents_ with our advanced conversion engine.

### ✨ Premium Features

- 🎯 **Real-time WYSIWYG Preview** - See your content exactly as it will appear
- 🎨 **Modern Glass Morphism UI** - Beautiful, cutting-edge interface design  
- 🚀 **Instant PDF Generation** - One-click conversion with perfect fidelity
- 📄 **Document Export** - Generate both PDF and DOCX formats
- 💻 **Advanced Code Highlighting** - Syntax highlighting for 100+ languages
- 📊 **Beautiful Tables** - Professional table styling with hover effects
- ✨ **Gradient Typography** - Eye-catching text effects throughout
- ⚡ **Micro-interactions** - Smooth animations and delightful user experience

### 💻 Code Showcase

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

### 📊 Feature Comparison Table

| Feature | Basic Editor | **PDFMyReadme** | Premium Tools |
|---------|-------------|-----------------|---------------|
| Real-time Preview | ❌ | ✅ **Instant** | ✅ |
| Modern UI | ❌ | ✅ **Glass Design** | ⚠️ |
| PDF Quality | ⚠️ Basic | ✅ **Perfect** | ✅ |
| DOCX Export | ❌ | ✅ **Advanced** | ✅ |
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
                        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto shadow-lg border border-gray-200" spellCheck="false">
                            <code className="text-sm font-mono">{children}</code>
                        </pre>
                    }
                >
                    <div className="relative my-6" spellCheck="false">
                        {/* Beautiful Language Indicator */}
                        <div className="absolute -top-0 right-4 z-10 language-indicator">
                            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 py-1.5 rounded-b-lg text-white text-xs font-bold uppercase tracking-wider shadow-xl border-t-0 border-l border-r border-b border-white/20 backdrop-blur-sm animate-gradient">
                                <div className="flex items-center space-x-1.5">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h.01a1 1 0 100-2H5zm3 0a1 1 0 000 2h3a1 1 0 100-2H8z" clipRule="evenodd" />
                                    </svg>
                                    <span>{match[1]}</span>
                                </div>
                            </div>
                        </div>
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-xl !mt-0 shadow-lg border border-gray-200 [&_*]:!text-decoration-none"
                            customStyle={{
                                textDecoration: 'none',
                                textDecorationLine: 'none',
                                WebkitTextDecorationLine: 'none',
                                paddingTop: '3rem' // Add padding to make room for language indicator
                            }}
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

    // Update CSS custom properties via useEffect
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty('--left-width', `${leftPanelWidth}%`);
            containerRef.current.style.setProperty('--right-width', `${100 - leftPanelWidth}%`);
        }
    }, [leftPanelWidth]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white" ref={containerRef}>
            {/* Top Navigation Bar */}
            <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-2 ring-white/20">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">PDFMyReadme</span>
                            </div>
                        </div>

                        {/* Stats in center */}
                        <div className="hidden md:flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-emerald-500/10 backdrop-blur rounded-xl px-4 py-2 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                <div className="text-sm font-bold text-emerald-400">{readmeText.length}</div>
                                <div className="text-xs text-emerald-300">chars</div>
                            </div>
                            <div className="flex items-center space-x-2 bg-blue-500/10 backdrop-blur rounded-xl px-4 py-2 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                                <div className="text-sm font-bold text-blue-400">{readmeText.split('\n').length}</div>
                                <div className="text-xs text-blue-300">lines</div>
                            </div>
                            <div className="flex items-center space-x-2 bg-purple-500/10 backdrop-blur rounded-xl px-4 py-2 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                                <div className="text-sm font-bold text-purple-400">{readmeText.split(' ').filter(word => word.length > 0).length}</div>
                                <div className="text-xs text-purple-300">words</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                            {/* Mobile dropdown for actions */}
                            <div className="md:hidden relative">
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={generateDocument}
                                        disabled={isGeneratingDoc || !readmeText.trim()}
                                        className="flex items-center px-2 py-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                                        title="Export DOCX"
                                    >
                                        {isGeneratingDoc ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={generatePDF}
                                        disabled={isGenerating || !readmeText.trim()}
                                        className="flex items-center px-2 py-2 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                                        title="Export PDF"
                                    >
                                        {isGenerating ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Desktop action buttons */}
                            <div className="hidden md:flex items-center space-x-3">
                                <button
                                    onClick={loadSampleMarkdown}
                                    className="flex items-center px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 backdrop-blur shadow-lg"
                                    title="Load Sample"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Sample
                                </button>

                                <button
                                    onClick={clearText}
                                    className="flex items-center px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 backdrop-blur shadow-lg"
                                    title="Clear All"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Clear
                                </button>

                                <button
                                    onClick={generateDocument}
                                    disabled={isGeneratingDoc || !readmeText.trim()}
                                    className="flex items-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/20"
                                    title="Export Document"
                                >
                                    {isGeneratingDoc ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                    {isGeneratingDoc ? 'Generating...' : 'Export DOCX'}
                                </button>

                                <button
                                    onClick={generatePDF}
                                    disabled={isGenerating || !readmeText.trim()}
                                    className="flex items-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-400/20"
                                    title="Export PDF"
                                >
                                    {isGenerating ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                    {isGenerating ? 'Generating...' : 'Export PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]" ref={containerRef}>
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row relative">
                    {/* Editor Panel */}
                    <div className="panel-left flex flex-col bg-gray-850 lg:min-h-0">
                        {/* Editor Header */}
                        <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 bg-gray-800/50 backdrop-blur border-b border-gray-700/50">
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white">Markdown Editor</h3>
                                    <p className="text-xs text-gray-400 hidden lg:block">Write your content</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="px-2 lg:px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-medium">
                                    Markdown
                                </div>
                                <div className="hidden lg:block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium">
                                    Auto-save
                                </div>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 p-3 lg:p-6">
                            <textarea
                                className="w-full h-full bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-lg p-3 lg:p-4 text-gray-100 placeholder-gray-500 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 smooth-transition custom-scrollbar shadow-lg"
                                placeholder="# Start writing your markdown here...

## Features
- Real-time preview
- Professional export
- Modern interface

Write something amazing! ✨"
                                value={readmeText}
                                onChange={(e) => setReadmeText(e.target.value)}
                                spellCheck="false"
                            />
                        </div>
                    </div>

                    {/* Draggable Separator */}
                    <div 
                        className={`separator hidden lg:flex ${isDragging ? 'dragging' : ''}`}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="separator-handle"></div>
                        <div className="separator-tooltip">
                            Drag to resize panels
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="panel-right flex flex-col bg-white border-l border-gray-700/50 lg:min-h-0">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 bg-gray-50/80 backdrop-blur border-b border-gray-200/50">
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Real-time Preview</h3>
                                    <p className="text-xs text-gray-500 hidden lg:block">WYSIWYG output</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="px-2 lg:px-3 py-1 bg-emerald-100/80 border border-emerald-200/50 rounded-full text-xs text-emerald-700 font-medium">
                                    Preview Mode
                                </div>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                            {error && (
                                <div className="m-3 lg:m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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

                            <div className="p-4 lg:p-8" ref={previewRef}>
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
                                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 via-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-8 shadow-2xl ring-4 ring-white/50 relative overflow-hidden float-animation">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-blue-400/20 to-purple-400/20 animate-pulse"></div>
                                            <svg className="w-12 h-12 text-emerald-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Start Creating</h3>
                                        <p className="text-gray-600 mb-8 max-w-md leading-relaxed">Transform your markdown into beautiful documents. Watch your content come to life with real-time preview!</p>
                                        <div className="px-8 py-4 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-xl text-emerald-700 text-sm font-medium border-2 border-emerald-200 shadow-lg relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-purple-400/10 animate-pulse"></div>
                                            <div className="relative z-10">💡 Try loading a sample to get started</div>
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
