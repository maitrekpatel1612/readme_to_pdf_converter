import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { content, title = 'Document' } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Parse markdown content into structured elements
    const lines = content.split('\n');
    const documentElements: Paragraph[] = [];

    // Add document title
    documentElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 32,
            color: "2E7D32",
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (!inCodeBlock) {
          // Start of code block
          inCodeBlock = true;
          codeBlockContent = [];
        } else {
          // End of code block
          inCodeBlock = false;
          
          // Add code block as a formatted paragraph
          if (codeBlockContent.length > 0) {
            documentElements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: codeBlockContent.join('\n'),
                    font: "Consolas",
                    size: 20,
                    color: "1a1a1a",
                  }),
                ],
                spacing: { before: 200, after: 200 },
                border: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                },
                shading: {
                  fill: "F5F5F5",
                },
              })
            );
          }
          codeBlockContent = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle headings
      if (trimmedLine.startsWith('#')) {
        // Flush any current list
        if (currentList.length > 0) {
          currentList.forEach(item => {
            documentElements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${item.replace(/^[-*+]\s*/, '')}`,
                    size: 22,
                  }),
                ],
                spacing: { before: 100, after: 100 },
                indent: { left: 400 },
              })
            );
          });
          currentList = [];
        }

        const level = (trimmedLine.match(/^#+/) || [''])[0].length;
        const text = trimmedLine.replace(/^#+\s*/, '');
        
        let headingLevel: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2 | typeof HeadingLevel.HEADING_3 | typeof HeadingLevel.HEADING_4;
        let fontSize = 28;
        
        switch (level) {
          case 1:
            headingLevel = HeadingLevel.HEADING_1;
            fontSize = 28;
            break;
          case 2:
            headingLevel = HeadingLevel.HEADING_2;
            fontSize = 26;
            break;
          case 3:
            headingLevel = HeadingLevel.HEADING_3;
            fontSize = 24;
            break;
          default:
            headingLevel = HeadingLevel.HEADING_4;
            fontSize = 22;
        }

        documentElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: text,
                bold: true,
                size: fontSize,
                color: level === 1 ? "1565C0" : "424242",
              }),
            ],
            heading: headingLevel,
            spacing: { before: 300, after: 200 },
          })
        );
        continue;
      }

      // Handle lists
      if (trimmedLine.match(/^[-*+]\s+/)) {
        currentList.push(trimmedLine);
        continue;
      }

      // Flush any current list before processing other content
      if (currentList.length > 0) {
        currentList.forEach(item => {
          documentElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${item.replace(/^[-*+]\s*/, '')}`,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 100 },
              indent: { left: 400 },
            })
          );
        });
        currentList = [];
      }

      // Handle blockquotes
      if (trimmedLine.startsWith('>')) {
        const text = trimmedLine.replace(/^>\s*/, '');
        if (text) {
          documentElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  italics: true,
                  size: 22,
                  color: "666666",
                }),
              ],
              spacing: { before: 200, after: 200 },
              indent: { left: 600 },
              border: {
                left: { style: BorderStyle.SINGLE, size: 4, color: "10B981" },
              },
            })
          );
        }
        continue;
      }

      // Handle regular paragraphs
      if (trimmedLine) {
        // Process inline formatting
        const processedText = trimmedLine;
        const textRuns: TextRun[] = [];
        
        // Simple inline code handling
        const codeRegex = /`([^`]+)`/g;
        let lastIndex = 0;
        let match;
        
        while ((match = codeRegex.exec(processedText)) !== null) {
          // Add text before code
          if (match.index > lastIndex) {
            const beforeText = processedText.substring(lastIndex, match.index);
            if (beforeText) {
              textRuns.push(new TextRun({
                text: beforeText,
                size: 22,
              }));
            }
          }
          
          // Add code text
          textRuns.push(new TextRun({
            text: match[1],
            font: "Consolas",
            size: 20,
            color: "D32F2F",
            shading: { fill: "F5F5F5" },
          }));
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < processedText.length) {
          textRuns.push(new TextRun({
            text: processedText.substring(lastIndex),
            size: 22,
          }));
        }
        
        // If no inline code found, add the whole text
        if (textRuns.length === 0) {
          textRuns.push(new TextRun({
            text: processedText,
            size: 22,
          }));
        }

        documentElements.push(
          new Paragraph({
            children: textRuns,
            spacing: { before: 150, after: 150 },
          })
        );
      } else {
        // Empty line - add some spacing
        documentElements.push(
          new Paragraph({
            children: [new TextRun({ text: "", size: 22 })],
            spacing: { before: 100, after: 100 },
          })
        );
      }
    }

    // Flush any remaining list items
    if (currentList.length > 0) {
      currentList.forEach(item => {
        documentElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item.replace(/^[-*+]\s*/, '')}`,
                size: 22,
              }),
            ],
            spacing: { before: 100, after: 100 },
            indent: { left: 400 },
          })
        );
      });
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,  // 1 inch
                bottom: 1440, // 1 inch
                left: 1440,   // 1 inch
              },
            },
          },
          children: documentElements,
        },
      ],
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // Return the document as a downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="README.docx"',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}
