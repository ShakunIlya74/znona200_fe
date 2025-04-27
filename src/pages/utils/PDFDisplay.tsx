import React, { memo, useMemo } from 'react';
import PDFViewer, { PDFViewerProps } from './PDFViewer';

const PDFDisplay: React.FC<PDFViewerProps> = (props) => {
    // Determine if we're in development environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    //TODO: check if this works in production
    // Memoize the calculated URL to prevent unnecessary re-renders
    const pdfUrl = useMemo(() => {
        // In development, use a local dummy PDF file from public folder
        // In production, use the proxied URL
        return isDevelopment
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

// Use React.memo to prevent re-rendering when props don't change
export default memo(PDFDisplay, (prevProps, nextProps) => {
    // Custom comparison function that determines if component should update
    // Return true if the props are equal (meaning don't re-render)
    
    // Compare pdfUrl specifically since it's the most important prop
    if (prevProps.pdfUrl !== nextProps.pdfUrl) {
        return false; // Props are different, should re-render
    }
    
    // Check other common props that might affect rendering
    if (prevProps.visiblePagePercentage !== nextProps.visiblePagePercentage) {
        return false;
    }
    
    // For any other props, we consider them equal to prevent re-renders
    return true;
});