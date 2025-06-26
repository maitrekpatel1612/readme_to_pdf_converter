# 📄 README to PDF Converter

A beautiful, modern web application that converts README files (and any text with basic Markdown formatting) into professional-looking PDF documents.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🎨 **Beautiful Modern UI** - Clean, responsive design with Tailwind CSS
- 📝 **Markdown Support** - Handles headings, lists, bold text, and code blocks
- 📄 **Professional PDFs** - Well-formatted output with proper typography
- 🚀 **Fast & Reliable** - Built with Next.js 15 and TypeScript
- 🔄 **Real-time Preview** - Character count and instant feedback
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🎯 **Error Handling** - Comprehensive error states and loading indicators
- 🎪 **Sample Content** - Built-in sample markdown to get started quickly

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd readme_to_pdf_converter
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

1. **Enter Text**: Paste your README content or any markdown text into the textarea
2. **Try Sample**: Click "Load Sample" to see an example of formatted content
3. **Generate PDF**: Click the "Generate PDF" button to create your document
4. **Download**: Click "Download PDF" to save the generated file

### Supported Markdown Features

- `# Heading 1` - Large headings
- `## Heading 2` - Medium headings  
- `### Heading 3` - Small headings
- `**Bold text**` - Bold formatting
- `- List items` - Bullet points
- `` ```code``` `` - Code blocks
- Line breaks and paragraphs

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **PDF Generation**: [PDFKit](https://pdfkit.org/)
- **Linting**: ESLint with Next.js config

## 📁 Project Structure

```
src/
├── app/
│   ├── api/generate-pdf/
│   │   └── route.ts          # PDF generation API endpoint
│   ├── globals.css           # Global styles and Tailwind imports
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main page component
└── ...
```

## 🔧 API Reference

### POST `/api/generate-pdf`

Generates a PDF from the provided text content.

**Request Body:**

```json
{
  "text": "Your markdown content here..."
}
```

**Response:**

- **Success**: PDF file as binary stream
- **Error**: JSON with error message

## 🎨 Customization

### Styling

- Modify `src/app/globals.css` for global styles
- Update Tailwind classes in components for UI changes
- Colors and spacing can be adjusted in the component files

### PDF Formatting

- Edit `src/app/api/generate-pdf/route.ts` to customize:
  - Font sizes and colors
  - Margins and spacing
  - Page layout
  - Markdown parsing logic

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with one click

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with PM2

## 🐛 Troubleshooting

### Common Issues

**PDF generation fails:**

- Check that all dependencies are installed
- Ensure the API route is accessible
- Verify that the text content is not empty

**Styling issues:**

- Make sure Tailwind CSS is properly configured
- Check that `globals.css` is imported in the layout

**TypeScript errors:**

- Run `npm run lint` to check for issues
- Ensure all type definitions are installed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [PDFKit](https://pdfkit.org/) - JavaScript PDF generation library
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Vercel](https://vercel.com/) - Platform for frontend frameworks and static sites

---

Made with ❤️ for the Open-source community by Maitrek Patel
