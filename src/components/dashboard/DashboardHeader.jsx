import React from 'react';
import { useWindowSize } from '../../utils/useWindowSize';
import bgLeft from '../../assets/dashboard-bg-left.svg';
import bgRight from '../../assets/dashboard-bg-right.svg';

const CornerDesign = ({ minDistance = 50, originalSize = 300 }) => {
    const { width, height } = useWindowSize();

    // 1. Compute corner coordinates
    // Top-Left: (0, 0)
    // Bottom-Right: (width, height)

    // 2. Calculate current distance between the inner tips of the triangles
    // Assuming triangles are placed at (0,0) and (width, height)
    const distance = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));

    // 3. Scale calculation logic
    // We determine how much of the diagonal the images occupy.
    // If the space is less than minDistance, we scale down.
    const combinedImageSize = originalSize * 2;
    const availableSpace = distance - minDistance;

    const scale = availableSpace < combinedImageSize
        ? availableSpace / combinedImageSize
        : 1;

    // Ensure scale doesn't go negative on extremely small screens
    const finalScale = Math.max(scale, 0.1) * 1.4;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Top Left Triangle */}
            <img
                src={bgLeft}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${originalSize * finalScale}px`,
                    transition: 'width 0.2s ease-out'
                }}
            />

            {/* Bottom Right Triangle */}
            <img
                src={bgRight}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: `${originalSize * finalScale}px`,
                    transition: 'width 0.2s ease-out'
                }}
            />
        </div>
    );
};

export default CornerDesign;