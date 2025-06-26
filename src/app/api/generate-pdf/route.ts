import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import MarkdownIt from "markdown-it";

// Configure markdown parser to match the live preview
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
}).enable(['table']);

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: "No text provided" },
                { status: 400 }
            );
        }

        // Create PDF with better settings to match preview
        const doc = new jsPDF({
            format: 'a4',
            unit: 'mm',
            orientation: 'portrait'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        // Color scheme matching the live preview
        const colors = {
            primary: '#111827',      // gray-900 (matches h1 in preview)
            secondary: '#374151',    // gray-700 (matches p in preview)
            accent: '#2563eb',       // blue-600 (matches links/accent)
            success: '#16a34a',      // green-600
            warning: '#d97706',      // amber-600
            muted: '#6b7280',        // gray-500
            light: '#f8fafc',        // slate-50
            border: '#e5e7eb',       // gray-200 (matches preview borders)
            codeBackground: '#1e293b', // slate-800 (matches code blocks)
            codeText: '#e2e8f0',     // slate-200
            quoteBackground: '#eff6ff', // blue-50 (matches blockquote)
            quoteBorder: '#3b82f6'   // blue-500
        };

        // Helper functions
        const addNewPageIfNeeded = (requiredHeight: number = 15) => {
            if (currentY + requiredHeight > pageHeight - 30) {
                doc.addPage();
                currentY = margin;
                return true;
            }
            return false;
        };

        const setFont = (size: number, style: 'normal' | 'bold' = 'normal', color: string = colors.primary) => {
            doc.setFontSize(size);
            doc.setFont('helvetica', style);
            doc.setTextColor(color);
        };

        const addStyledText = (text: string, fontSize: number, style: 'normal' | 'bold' = 'normal', color: string = colors.primary, lineHeight: number = 1.4, leftMargin: number = 0) => {
            setFont(fontSize, style, color);
            const lines = doc.splitTextToSize(text, contentWidth - leftMargin);
            const actualLineHeight = fontSize * 0.35 * lineHeight;
            
            addNewPageIfNeeded(lines.length * actualLineHeight + 4);
            
            for (let i = 0; i < lines.length; i++) {
                doc.text(lines[i], margin + leftMargin, currentY + (i * actualLineHeight));
            }
            
            currentY += lines.length * actualLineHeight + 4;
        };

        const addHeading = (text: string, level: number) => {
            // Heading styles that match the live preview exactly
            const headingStyles = [
                { size: 24, color: colors.primary, spacing: 10, underline: true },   // H1 - matches text-3xl
                { size: 20, color: colors.primary, spacing: 8, underline: false },   // H2 - matches text-2xl  
                { size: 16, color: colors.primary, spacing: 6, underline: false },   // H3 - matches text-xl
                { size: 14, color: colors.secondary, spacing: 5, underline: false }, // H4
                { size: 12, color: colors.secondary, spacing: 4, underline: false }, // H5
                { size: 11, color: colors.secondary, spacing: 3, underline: false }  // H6
            ];
            
            const style = headingStyles[Math.min(level - 1, 5)];
            
            // Add spacing before heading (matches preview margins)
            currentY += style.spacing;
            
            addStyledText(text, style.size, 'bold', style.color, 1.2);
            
            // Add underline for H1 (matches border-b-2 in preview)
            if (style.underline) {
                const textWidth = doc.getTextWidth(text);
                doc.setDrawColor(colors.border);
                doc.setLineWidth(0.5);
                doc.line(margin, currentY - 2, margin + Math.min(textWidth, contentWidth), currentY - 2);
                currentY += 2;
            }
        };

        const addCodeBlock = (code: string, language: string = '') => {
            const lines = code.split('\n');
            const lineHeight = 4.5;
            const padding = 6;
            const headerHeight = language ? 8 : 0;
            const blockHeight = (lines.length * lineHeight) + (padding * 2) + headerHeight;
            
            addNewPageIfNeeded(blockHeight + 10);
            
            // Background rectangle (matches the dark theme in preview)
            doc.setFillColor(30, 41, 59); // slate-800
            doc.rect(margin, currentY, contentWidth, blockHeight, 'F');
            
            // Language label (matches preview styling)
            if (language) {
                doc.setFillColor(59, 130, 246); // blue-500
                doc.rect(margin, currentY, Math.min(language.length * 4 + 10, 50), 7, 'F');
                
                setFont(8, 'bold', '#ffffff');
                doc.text(language.toUpperCase(), margin + 3, currentY + 5);
                currentY += headerHeight;
            }
            
            // Code content with monospace font
            setFont(10, 'normal', colors.codeText);
            doc.setFont('courier', 'normal');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].replace(/\t/g, '    '); // Convert tabs to spaces
                doc.text(line, margin + 4, currentY + padding + (i * lineHeight));
            }
            
            currentY += blockHeight - (language ? headerHeight : 0) + 10;
        };

        const addTable = (headers: string[], rows: string[][]) => {
            if (!headers.length || !rows.length) return;
            
            const cellPadding = 4;
            const rowHeight = 12;
            const colWidth = contentWidth / headers.length;
            const tableHeight = (rows.length + 1) * rowHeight;
            
            addNewPageIfNeeded(tableHeight + 20);
            
            // Table border (matches preview border styling)
            doc.setDrawColor(colors.border);
            doc.setLineWidth(0.5);
            doc.rect(margin, currentY, contentWidth, tableHeight);
            
            // Header row (matches gray-50 background in preview)
            doc.setFillColor(249, 250, 251); // gray-50
            doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
            
            setFont(11, 'bold', colors.primary);
            
            for (let i = 0; i < headers.length; i++) {
                const x = margin + (i * colWidth);
                const headerText = doc.splitTextToSize(headers[i], colWidth - cellPadding * 2);
                doc.text(headerText[0] || '', x + cellPadding, currentY + 8);
                
                // Column separators
                if (i > 0) {
                    doc.setDrawColor(colors.border);
                    doc.line(x, currentY, x, currentY + tableHeight);
                }
            }
            
            currentY += rowHeight;
            
            // Data rows
            setFont(10, 'normal', colors.secondary);
            
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                const row = rows[rowIndex];
                
                // Row separators
                doc.setDrawColor(colors.border);
                doc.line(margin, currentY, margin + contentWidth, currentY);
                
                for (let colIndex = 0; colIndex < Math.min(row.length, headers.length); colIndex++) {
                    const x = margin + (colIndex * colWidth);
                    const cellText = doc.splitTextToSize(row[colIndex] || '', colWidth - cellPadding * 2);
                    doc.text(cellText[0] || '', x + cellPadding, currentY + 8);
                }
                
                currentY += rowHeight;
            }
            
            currentY += 10;
        };

        const addBlockquote = (text: string) => {
            const lineHeight = 5.5;
            const padding = 6;
            const lines = doc.splitTextToSize(text, contentWidth - 25);
            const blockHeight = (lines.length * lineHeight) + (padding * 2);
            
            addNewPageIfNeeded(blockHeight + 8);
            
            // Left border (matches blue-500 in preview)
            doc.setFillColor(59, 130, 246); // blue-500
            doc.rect(margin, currentY, 4, blockHeight, 'F');
            
            // Background (matches blue-50 in preview)
            doc.setFillColor(239, 246, 255); // blue-50
            doc.rect(margin + 4, currentY, contentWidth - 4, blockHeight, 'F');
            
            // Text with italic styling (matches preview)
            setFont(11, 'normal', colors.secondary);
            doc.setFont('helvetica', 'italic'); // Add italic style
            
            for (let i = 0; i < lines.length; i++) {
                doc.text(lines[i], margin + 10, currentY + padding + (i * lineHeight));
            }
            
            currentY += blockHeight + 8;
        };

        const addList = (items: string[], ordered: boolean = false, level: number = 0) => {
            setFont(11, 'normal', colors.secondary);
            const indent = level * 8; // Matches preview indentation
            
            for (let i = 0; i < items.length; i++) {
                const bullet = ordered ? `${i + 1}.` : '•';
                const itemText = `${bullet} ${items[i]}`;
                const lines = doc.splitTextToSize(itemText, contentWidth - 20 - indent);
                const lineHeight = 5.5;
                
                addNewPageIfNeeded(lines.length * lineHeight + 3);
                
                for (let j = 0; j < lines.length; j++) {
                    const x = j === 0 ? margin + indent : margin + 15 + indent;
                    doc.text(lines[j], x, currentY + (j * lineHeight));
                }
                
                currentY += lines.length * lineHeight + 3;
            }
            
            currentY += 2; // Extra spacing after list
        };

        // Document header (matches the professional look of the preview)
        setFont(28, 'bold', colors.accent);
        doc.text('📄 README Document', margin, currentY);
        currentY += 12;

        setFont(10, 'normal', colors.muted);
        doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`, margin, currentY);
        currentY += 20;

        // Parse and render markdown exactly like the preview
        const tokens = md.parse(text, {});
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            switch (token.type) {
                case 'heading_open':
                    const level = parseInt(token.tag.substring(1));
                    const nextToken = tokens[i + 1];
                    if (nextToken && nextToken.type === 'inline') {
                        addHeading(nextToken.content, level);
                        i++; // Skip the inline token
                    }
                    break;
                    
                case 'paragraph_open':
                    const paraToken = tokens[i + 1];
                    if (paraToken && paraToken.type === 'inline') {
                        // Advanced inline formatting processing to match preview exactly
                        const content = paraToken.content;
                        
                        // Split text by formatting markers and process each part
                        const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/);
                        
                        for (const part of parts) {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                // Bold text
                                const boldText = part.slice(2, -2);
                                addStyledText(boldText, 11, 'bold', colors.secondary, 1.6);
                            } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                                // Italic text
                                const italicText = part.slice(1, -1);
                                setFont(11, 'normal', colors.secondary);
                                doc.setFont('helvetica', 'italic');
                                const lines = doc.splitTextToSize(italicText, contentWidth);
                                const lineHeight = 11 * 0.35 * 1.6;
                                
                                addNewPageIfNeeded(lines.length * lineHeight + 4);
                                
                                for (let k = 0; k < lines.length; k++) {
                                    doc.text(lines[k], margin, currentY + (k * lineHeight));
                                }
                                currentY += lines.length * lineHeight + 4;
                            } else if (part.startsWith('`') && part.endsWith('`')) {
                                // Inline code
                                const codeText = part.slice(1, -1);
                                setFont(10, 'normal', colors.accent);
                                doc.setFont('courier', 'normal');
                                doc.text(codeText, margin, currentY);
                                currentY += 6;
                            } else if (part.trim()) {
                                // Regular text
                                addStyledText(part, 11, 'normal', colors.secondary, 1.6);
                            }
                        }
                        
                        // If no special formatting, add as regular text
                        if (!content.includes('**') && !content.includes('*') && !content.includes('`')) {
                            addStyledText(content, 11, 'normal', colors.secondary, 1.6);
                        }
                        
                        i++; // Skip the inline token
                    }
                    break;
                    
                case 'code_block':
                case 'fence':
                    addCodeBlock(token.content, token.info || '');
                    break;
                    
                case 'blockquote_open':
                    // Find the content of the blockquote
                    let quoteContent = '';
                    let j = i + 1;
                    while (j < tokens.length && tokens[j].type !== 'blockquote_close') {
                        if (tokens[j].type === 'inline') {
                            quoteContent += tokens[j].content + ' ';
                        }
                        j++;
                    }
                    addBlockquote(quoteContent.trim());
                    i = j; // Skip to after blockquote_close
                    break;
                    
                case 'bullet_list_open':
                case 'ordered_list_open':
                    const isOrdered = token.type === 'ordered_list_open';
                    const listItems: string[] = [];
                    let k = i + 1;
                    
                    while (k < tokens.length && tokens[k].type !== (isOrdered ? 'ordered_list_close' : 'bullet_list_close')) {
                        if (tokens[k].type === 'inline') {
                            listItems.push(tokens[k].content);
                        }
                        k++;
                    }
                    
                    addList(listItems, isOrdered, 0);
                    i = k; // Skip to after list_close
                    break;
                    
                case 'table_open':
                    // Parse table exactly like the preview
                    const tableHeaders: string[] = [];
                    const tableRows: string[][] = [];
                    let l = i + 1;
                    let inHeader = false;
                    let currentRow: string[] = [];
                    
                    while (l < tokens.length && tokens[l].type !== 'table_close') {
                        if (tokens[l].type === 'thead_open') {
                            inHeader = true;
                        } else if (tokens[l].type === 'thead_close') {
                            inHeader = false;
                        } else if (tokens[l].type === 'tr_open') {
                            currentRow = [];
                        } else if (tokens[l].type === 'tr_close') {
                            if (inHeader) {
                                tableHeaders.push(...currentRow);
                            } else {
                                tableRows.push([...currentRow]);
                            }
                        } else if (tokens[l].type === 'inline') {
                            currentRow.push(tokens[l].content);
                        }
                        l++;
                    }
                    
                    if (tableHeaders.length > 0) {
                        addTable(tableHeaders, tableRows);
                    }
                    i = l; // Skip to after table_close
                    break;
                    
                case 'hr':
                    currentY += 8;
                    doc.setDrawColor(colors.border);
                    doc.setLineWidth(0.5);
                    doc.line(margin, currentY, margin + contentWidth, currentY);
                    currentY += 12;
                    break;
            }
        }

        // Add footer to all pages (matches professional look)
        const totalPages = doc.getNumberOfPages();
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            doc.setPage(pageNum);
            
            // Footer line
            doc.setDrawColor(colors.border);
            doc.setLineWidth(0.3);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            
            // Page number
            setFont(8, 'normal', colors.muted);
            doc.text(
                `Page ${pageNum} of ${totalPages}`, 
                pageWidth / 2, 
                pageHeight - 8, 
                { align: 'center' }
            );
            
            // Footer text
            doc.text(
                'Generated by README to PDF Converter', 
                margin, 
                pageHeight - 8
            );
        }

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=README.pdf",
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
