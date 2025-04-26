import React from 'react';
import PDFViewer, { PDFViewerProps } from './PDFViewer';

const PDFDisplay: React.FC<PDFViewerProps> = (props) => {
    // Determine if we're in development environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // TODO: check if it works properly in production
    // In development, use a local dummy PDF file from public folder
    // In production, use the proxied URL
    const pdfUrl = isDevelopment
        ? `${window.location.origin}/slide.pdf`
        : props.pdfUrl;
    
    console.log('PDF URL:', pdfUrl); // Log the PDF URL for debugging
    
    return (
        <PDFViewer
            {...props}
            pdfUrl={pdfUrl}
        />
    );
};

export default PDFDisplay;