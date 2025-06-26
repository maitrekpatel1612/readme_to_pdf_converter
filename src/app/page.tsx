"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import NoSSR from "../components/NoSSR";

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

    // Update CSS custom properties for panel widths
    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.style.setProperty(
                "--left-panel-width",
                `${leftPanelWidth}%`
            );
            document.documentElement.style.setProperty(
                "--right-panel-width",
                `${100 - leftPanelWidth}%`
            );
        }
    }, [leftPanelWidth]);

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
                backgroundColor: "#ffffff",
                logging: false,
                width: previewRef.current.scrollWidth,
                height: previewRef.current.scrollHeight,
                scrollX: 0,
                scrollY: 0,
            });

            // Create PDF with the captured image
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            const margin = 0;

            let position = margin;

            // Add the first page
            pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(
                    imgData,
                    "PNG",
                    margin,
                    position,
                    imgWidth,
                    imgHeight
                );
                heightLeft -= pageHeight;
            }

            // Download the PDF directly
            const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
            pdf.save(`README_${currentDate}.pdf`);
        } catch (err) {
            console.error("PDF generation error:", err);
            setError(
                err instanceof Error ? err.message : "Failed to generate PDF"
            );
        } finally {
            setIsGenerating(false);
        }
    }, [readmeText]);

    // Handle draggable separator
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);

        // Add user-select: none to body to prevent text selection during drag
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth =
                ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Constrain between 20% and 80%
            const constrainedWidth = Math.min(80, Math.max(20, newLeftWidth));
            setLeftPanelWidth(constrainedWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);

            // Restore body styles
            document.body.style.userSelect = "";
            document.body.style.cursor = "";

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }, []);

    const generateDocument = useCallback(async () => {
        if (!readmeText.trim()) {
            setError("Please enter some text to convert");
            return;
        }

        setIsGeneratingDoc(true);
        setError(null);

        try {
            const response = await fetch("/api/generate-doc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: readmeText,
                    title: "README Document",
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "README.docx";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Document generation error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate document"
            );
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

- 🎯 **Real-time Readme Preview** - See your content exactly as it will appear
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

    const markdownComponents = useMemo(
        () => ({
            code({
                inline,
                className,
                children,
                ...props
            }: MarkdownComponentProps & { inline?: boolean }) {
                const match = /language-(\w+)/.exec(className || "");

                return !inline && match ? (
                    <NoSSR
                        fallback={
                            <pre
                                className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto shadow-lg border border-gray-200"
                                spellCheck="false"
                            >
                                <code className="text-sm font-mono">
                                    {children}
                                </code>
                            </pre>
                        }
                    >
                        <div className="relative my-6" spellCheck="false">
                            {/* Beautiful Language Indicator */}
                            <div className="absolute -top-0 right-4 z-10 language-indicator">
                                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 py-1.5 rounded-b-lg text-white text-xs font-bold uppercase tracking-wider shadow-xl border-t-0 border-l border-r border-b border-white/20 backdrop-blur-sm animate-gradient">
                                    <div className="flex items-center space-x-1.5">
                                        <svg
                                            className="w-3 h-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h.01a1 1 0 100-2H5zm3 0a1 1 0 000 2h3a1 1 0 100-2H8z"
                                                clipRule="evenodd"
                                            />
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
                                    textDecoration: "none",
                                    textDecorationLine: "none",
                                    WebkitTextDecorationLine: "none",
                                    paddingTop: "3rem", // Add padding to make room for language indicator
                                }}
                                {...props}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        </div>
                    </NoSSR>
                ) : (
                    <code
                        className={`${className} bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md text-sm font-medium border border-emerald-200`}
                        {...props}
                    >
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
                    <div className="text-gray-700 italic">{children}</div>
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
                <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
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
            a: ({
                children,
                href,
            }: MarkdownComponentProps & { href?: string }) => (
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
                <em className="italic text-gray-800">{children}</em>
            ),
        }),
        []
    );

    // Update CSS custom properties via useEffect
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                "--left-width",
                `${leftPanelWidth}%`
            );
            containerRef.current.style.setProperty(
                "--right-width",
                `${100 - leftPanelWidth}%`
            );
        }
    }, [leftPanelWidth]);

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
            ref={containerRef}
        >
            {/* Top Navigation Bar */}
            <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl mobile-nav-compact xs-mobile-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 xs-mobile-nav">
                        {/* Logo & Brand */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 nav-logo xs-mobile-nav bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-2 ring-white/20">
                                    <svg
                                        className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-lg sm:text-xl nav-brand xs-mobile-nav font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    PDFMyReadme
                                </span>
                            </div>
                        </div>

                        {/* Stats in center - Hidden on mobile, shown on desktop */}
                        <div className="hidden lg:flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-emerald-500/10 backdrop-blur rounded-xl px-4 py-2 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                <div className="text-sm font-bold text-emerald-400">
                                    {readmeText.length}
                                </div>
                                <div className="text-xs text-emerald-300">
                                    chars
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 bg-blue-500/10 backdrop-blur rounded-xl px-4 py-2 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                                <div className="text-sm font-bold text-blue-400">
                                    {readmeText.split("\n").length}
                                </div>
                                <div className="text-xs text-blue-300">
                                    lines
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 bg-purple-500/10 backdrop-blur rounded-xl px-4 py-2 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                                <div className="text-sm font-bold text-purple-400">
                                    {
                                        readmeText
                                            .split(" ")
                                            .filter((word) => word.length > 0)
                                            .length
                                    }
                                </div>
                                <div className="text-xs text-purple-300">
                                    words
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1 sm:space-x-2 mobile-actions xs-mobile-actions">
                            {/* Mobile compact action buttons */}
                            <div className="lg:hidden flex items-center space-x-1">
                                <button
                                    onClick={loadSampleMarkdown}
                                    className="mobile-action-btn xs-mobile-action-btn p-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300 backdrop-blur shadow-lg"
                                    title="Load Sample"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={clearText}
                                    className="mobile-action-btn xs-mobile-action-btn p-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300 backdrop-blur shadow-lg"
                                    title="Clear All"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={generateDocument}
                                    disabled={
                                        isGeneratingDoc || !readmeText.trim()
                                    }
                                    className="mobile-action-btn xs-mobile-action-btn p-2 bg-blue-500 text-white hover:bg-blue-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                                    title="Export DOCX"
                                >
                                    {isGeneratingDoc ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={generatePDF}
                                    disabled={
                                        isGenerating || !readmeText.trim()
                                    }
                                    className="mobile-action-btn xs-mobile-action-btn p-2 bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                                    title="Export PDF"
                                >
                                    {isGenerating ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Desktop action buttons */}
                            <div className="hidden md:flex items-center space-x-3">
                                <button
                                    onClick={loadSampleMarkdown}
                                    className="flex items-center px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 backdrop-blur shadow-lg"
                                    title="Load Sample"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                    Sample
                                </button>

                                <button
                                    onClick={clearText}
                                    className="flex items-center px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 backdrop-blur shadow-lg"
                                    title="Clear All"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Clear
                                </button>

                                <button
                                    onClick={generateDocument}
                                    disabled={
                                        isGeneratingDoc || !readmeText.trim()
                                    }
                                    className="flex items-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/20"
                                    title="Export Document"
                                >
                                    {isGeneratingDoc ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    )}
                                    {isGeneratingDoc
                                        ? "Generating..."
                                        : "Export DOCX"}
                                </button>

                                <button
                                    onClick={generatePDF}
                                    disabled={
                                        isGenerating || !readmeText.trim()
                                    }
                                    className="flex items-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-400/20"
                                    title="Export PDF"
                                >
                                    {isGenerating ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    )}
                                    {isGenerating
                                        ? "Generating..."
                                        : "Export PDF"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Stats Bar - Only visible on mobile */}
            <div className="lg:hidden mobile-stats mobile-only">
                <div className="flex items-center justify-around p-3 bg-black/30 backdrop-blur-xl border-b border-white/10">
                    <div className="stat-item text-center">
                        <div className="text-sm font-bold text-emerald-400">
                            {readmeText.length}
                        </div>
                        <div className="text-xs text-emerald-300">chars</div>
                    </div>
                    <div className="stat-item text-center">
                        <div className="text-sm font-bold text-blue-400">
                            {readmeText.split("\n").length}
                        </div>
                        <div className="text-xs text-blue-300">lines</div>
                    </div>
                    <div className="stat-item text-center">
                        <div className="text-sm font-bold text-purple-400">
                            {
                                readmeText
                                    .split(" ")
                                    .filter((word) => word.length > 0).length
                            }
                        </div>
                        <div className="text-xs text-purple-300">words</div>
                    </div>
                </div>
            </div>

            <div
                className="flex flex-col lg:flex-row h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)] split-container landscape-mobile"
                ref={containerRef}
            >
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row relative">
                    {/* Editor Panel */}
                    <div className="panel-left flex flex-col bg-gray-850 lg:min-h-0 mobile-editor xs-mobile-editor resizable-panel-left">
                        {/* Editor Header */}
                        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gray-800/50 backdrop-blur border-b border-gray-700/50">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg
                                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-medium text-white">
                                        Markdown Editor
                                    </h3>
                                    <p className="text-xs text-gray-400 hidden lg:block">
                                        Write your content
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <div className="px-2 lg:px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-medium">
                                    Markdown
                                </div>
                                <div className="hidden sm:block lg:block px-2 lg:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium xs-hide">
                                    Auto-save
                                </div>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 p-2 sm:p-3 lg:p-6 mobile-editor xs-mobile-editor">
                            <textarea
                                className="w-full h-full bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-lg p-2 sm:p-3 lg:p-4 text-gray-100 placeholder-gray-500 font-mono text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 smooth-transition custom-scrollbar touch-scroll shadow-lg mobile-text-sm"
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

                    {/* Draggable Separator - Always visible on lg+ */}
                    <div
                        className={`separator hidden lg:flex ${
                            isDragging ? "dragging" : ""
                        } desktop-only resizable-separator`}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="separator-handle"></div>
                        <div className="separator-tooltip">
                            Drag to resize panels
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="panel-right flex flex-col bg-white border-l border-gray-700/50 lg:min-h-0 mobile-preview xs-mobile-preview resizable-panel-right">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gray-50/80 backdrop-blur border-b border-gray-200/50">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg
                                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                                        Real-time Preview
                                    </h3>
                                    <p className="text-xs text-gray-500 hidden lg:block">
                                        Output
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <div className="px-2 lg:px-3 py-1 bg-emerald-100/80 border border-emerald-200/50 rounded-full text-xs text-emerald-700 font-medium">
                                    Preview Mode
                                </div>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto bg-white custom-scrollbar touch-scroll mobile-preview xs-mobile-preview">
                            {error && (
                                <div className="m-2 sm:m-3 lg:m-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2">
                                            <svg
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-medium text-red-800">
                                                Error
                                            </h4>
                                            <p className="text-xs sm:text-sm text-red-700">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div
                                className="p-3 sm:p-4 lg:p-8 mobile-preview xs-mobile-preview"
                                ref={previewRef}
                            >
                                {readmeText.trim() ? (
                                    <div className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-enhanced mobile-preview xs-mobile-preview">
                                        {isMounted ? (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={markdownComponents}
                                            >
                                                {readmeText}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 lg:py-16">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 float-animation">
                                            <svg
                                                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                                            Start Writing Your Markdown
                                        </h3>
                                        <p className="text-xs sm:text-sm lg:text-base text-gray-500 max-w-md mobile-text-sm">
                                            Type in the editor on the left to
                                            see a live preview here.
                                            <span className="hidden sm:inline">
                                                Use the sample button to get
                                                started quickly!
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Minimal Footer */}
            <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700/50 backdrop-blur-lg footer-backdrop mobile-footer xs-mobile-footer">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mobile-footer xs-mobile-footer">
                    <div className="flex flex-col items-center justify-center gap-6">
                        {/* Brand and Social Links */}
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg
                                        className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent animated-gradient-text">
                                    PDFMyReadme
                                </span>
                            </div>

                            <div className="flex items-center space-x-3 sm:space-x-4 social-links">
                                {/* GitHub */}
                                <a
                                    href="https://github.com/maitrekpatel1612"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-8 h-8 sm:w-10 sm:h-10 bg-gray-700/50 backdrop-blur rounded-lg flex items-center justify-center hover:bg-gray-600/50 transition-all duration-300 hover:scale-110 hover:shadow-lg social-icon footer-link"
                                    title="GitHub"
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                                {/* LinkedIn */}
                                <a
                                    href="https://www.linkedin.com/in/maitrek-patel-3428a9258/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-8 h-8 sm:w-10 sm:h-10 bg-gray-700/50 backdrop-blur rounded-lg flex items-center justify-center hover:bg-blue-600/50 transition-all duration-300 hover:scale-110 hover:shadow-lg social-icon footer-link"
                                    title="LinkedIn"
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                {/* X (formerly Twitter) */}
                                <a
                                    href="https://x.com/MaitrekP97201"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-8 h-8 sm:w-10 sm:h-10 bg-gray-700/50 backdrop-blur rounded-lg flex items-center justify-center hover:bg-black/50 transition-all duration-300 hover:scale-110 hover:shadow-lg social-icon footer-link"
                                    title="X (formerly Twitter)"
                                >
                                    <svg
                                        className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white transition-colors"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                {/* Portfolio Website */}
                                <a
                                    href="https://maitrekpatel.tech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-8 h-8 sm:w-10 sm:h-10 bg-gray-700/50 backdrop-blur rounded-lg flex items-center justify-center hover:bg-purple-600/50 transition-all duration-300 hover:scale-110 hover:shadow-lg social-icon footer-link"
                                    title="Portfolio"
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Copyright at the bottom */}
                        <div className="w-full border-t border-gray-700/30 pt-4">
                            <div className="text-center">
                                <span className="text-xs sm:text-sm text-gray-400">
                                    © {new Date().getFullYear()} PDFMyReadme.
                                    Built with{" "}
                                    <span className="animate-heartbeat text-red-500">
                                        💖
                                    </span>{" "}
                                    by Maitrek Patel
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
