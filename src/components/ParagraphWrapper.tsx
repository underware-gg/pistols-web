import React, { ReactNode, useEffect, useRef } from 'react';
import useContentDimensions from '../hooks/useContentHeight';

type ParagraphWrapperProps = {
  id?: string;
  children: ReactNode;
  backgroundTilt?: 'left' | 'right';
  decorations?: ReactNode;
};

/**
 * A wrapper component that handles dynamic height for ParagraphBlack and ParagraphBackground
 * Measures the height of its children and applies that to the background
 */
const ParagraphWrapper: React.FC<ParagraphWrapperProps> = ({ 
  id, 
  children, 
  backgroundTilt = 'right',
  decorations
}) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const carvingsRef = useRef<HTMLDivElement>(null);
  
  const { height: contentHeight } = useContentDimensions(contentRef);
  const { height: carvingsHeight } = useContentDimensions(carvingsRef);

  useEffect(() => {
    if (carvingsRef.current) {
      carvingsRef.current.style.setProperty('--content-height', `${contentHeight}px`);
    }

    if (backgroundRef.current) {
      backgroundRef.current.style.setProperty('--content-height', `${contentHeight}px`);
    }
  }, [carvingsHeight, contentHeight]);
  

  return (
    <div className="DisplayFlex Centered FlexColumn">
      <div id={id} ref={carvingsRef} className="ParagraphBlack">
        {decorations}
        
        <div ref={contentRef} className="paragraph-content">
          {children}
        </div>
      </div>
      <div ref={backgroundRef} className={`ParagraphBackground tilt-${backgroundTilt}`} />
    </div>
  );
};

export default ParagraphWrapper; 