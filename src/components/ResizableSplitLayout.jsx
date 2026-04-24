import React, { useState, useCallback, useEffect, useRef } from 'react';

export default function ResizableSplitLayout({ 
    leftContent, 
    rightContent, 
    initialLeftWidth = 40,
    minLeftWidth = 20,
    maxLeftWidth = 70
}) {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const containerWidth = rect.width;
            const newLeftWidth = (relativeX / containerWidth) * 100;

            if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
                setLeftWidth(newLeftWidth);
            }
        }
    }, [isResizing, minLeftWidth, maxLeftWidth]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            // Prevent text selection while resizing
            document.body.style.userSelect = 'none';
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.userSelect = 'auto';
            
            // Trigger a resize event to notify Blockly and other components
            window.dispatchEvent(new Event('resize'));
        }

        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    return (
        <div className="assignment-split-content" ref={containerRef}>
            <div 
                className="left-panel" 
                style={{ width: `${leftWidth}%`, minWidth: 'unset' }}
            >
                {leftContent}
            </div>
            
            <div 
                className="resize-handle"
                onMouseDown={startResizing}
                style={{ 
                    cursor: 'col-resize',
                    width: '10px',
                    margin: '0 -5px',
                    zIndex: 10,
                    position: 'relative'
                }}
            >
                <div className="resize-handle-line"></div>
            </div>

            <div 
                className="right-panel" 
                style={{ flex: 1 }}
            >
                {rightContent}
            </div>
        </div>
    );
}
