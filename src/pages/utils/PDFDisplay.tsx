import React, { useMemo } from 'react';
import PDFViewer, { PDFViewerProps } from './PDFViewer';

const PDFDisplay: React.FC<PDFViewerProps> = (props) => {
    // Determine if we're in development environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    //TODO: check if this works in production
    // Memoize the calculated URL to prevent unnecessary re-renders
    const pdfUrl = useMemo(() => {
        // In development, use a local dummy PDF file from public folder
        // In production, use the proxied URL
        return isDevelopment && (props?.visiblePagePercentage ?? 1) < 1
            ? `${window.location.origin}/notes.pdf`
            : isDevelopment && (props?.visiblePagePercentage ?? 1) === 1
            ? `${window.location.origin}/slide.pdf`
            : props.pdfUrl;
    }, [isDevelopment, props.pdfUrl]);
      return (
        <PDFViewer
            {...props}
            pdfUrl={pdfUrl}
        />
    );
};

export default PDFDisplay;