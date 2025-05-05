import { motion as m, useMotionValue, useAnimationFrame } from 'framer-motion';
import { Image } from 'semantic-ui-react';
import { useEffect, useState } from 'react';

const Cloud = ({
  src,
  startX,
  endX,
  yPositions,
  duration,
  delay = 0,
  width = 500,
  top = 0,
  zIndex = 1,
  opacity = 0.8
}: {
  src: string;
  startX: any;
  endX: string;
  yPositions: number[];
  duration: number;
  delay: number;
  width: any;
  top: any;
  zIndex: number;
  opacity: number;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const z = useMotionValue(zIndex);
  const startTime = useMotionValue<number | null>(null);
  const cloudOpacity = useMotionValue(0);
  
  // Store dimensions in state to handle SSR
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Update dimensions on client-side only
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Initialize animation values once dimensions are available
  useEffect(() => {
    if (dimensions.width > 0 && !isInitialized) {
      setIsInitialized(true);
      
      // Parse startX to position cloud properly initially
      const parsePosition = (pos: string | number, viewportWidth: number): number => {
        if (typeof pos === 'number') return pos;
        
        const value = parseFloat(pos);
        if (pos.includes('vw')) return (value / 100) * viewportWidth;
        if (pos.includes('px')) return value;
        return value;
      };
      
      const startXValue = parsePosition(startX, dimensions.width);
      x.set(startXValue);
      
      // Set initial opacity to 0
      cloudOpacity.set(0);
      
      // Animate opacity from 0 to 0.85 over 1 second with easeOutCubic
      const fadeInAnimation = () => {
        const startTime = performance.now();
        const duration = 1000; // 1 second
        
        const animateOpacity = (timestamp: number) => {
          const elapsed = timestamp - startTime;
          if (elapsed < duration) {
            const progress = elapsed / duration;
            // easeOutCubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            cloudOpacity.set(easedProgress * opacity);
            requestAnimationFrame(animateOpacity);
          } else {
            cloudOpacity.set(opacity);
          }
        };
        
        requestAnimationFrame(animateOpacity);
      };
      
      // Start the fade-in animation after the delay
      setTimeout(fadeInAnimation);
    }
  }, [dimensions, isInitialized, startX, x, delay]);
  
  // Convert duration from seconds to milliseconds
  const durationMs = duration * 1000;
  // Convert delay to milliseconds for initial offset
  const initialElapsedMs = delay * durationMs;
  
  useAnimationFrame((t) => {
    if (!isInitialized || dimensions.width === 0) return; // Skip if not initialized
    
    // Parse startX and endX to get numeric values
    const parsePosition = (pos: string | number, viewportWidth: number): number => {
      if (typeof pos === 'number') return pos;
      
      const value = parseFloat(pos);
      if (pos.includes('vw')) return (value / 100) * viewportWidth;
      if (pos.includes('px')) return value;
      return value;
    };
    
    const startXValue = parsePosition(startX, dimensions.width);
    const endXValue = parsePosition(endX, dimensions.width);
    
    // Calculate total distance for X
    const totalXDistance = endXValue - startXValue;
    
    if (startTime.get() === null) {
      // Set start time with initial offset to simulate already elapsed time
      startTime.set(t - initialElapsedMs);
    }
    
    const elapsed = t - (startTime.get() || 0);
    
    const xProgress = (elapsed % durationMs) / durationMs;
    
    // Calculate current X position
    const currentX = startXValue + xProgress * totalXDistance;
    x.set(currentX);
    
    // Calculate current Y position (oscillating between yPositions)
    if (yPositions.length > 0) {
      const yProgress = (elapsed % durationMs) / durationMs;
      const yIndex = Math.floor(yProgress * yPositions.length);
      const nextYIndex = (yIndex + 1) % yPositions.length;
      const ySubProgress = (yProgress * yPositions.length) % 1;
      
      const currentY = yPositions[yIndex] + 
        (yPositions[nextYIndex] - yPositions[yIndex]) * ySubProgress;
      
      y.set(currentY);
    }
    
    // Oscillate Z value slightly for depth effect
    const zProgress = (elapsed % durationMs) / durationMs;
    const zVariation = Math.sin(zProgress * Math.PI * 2) * 0.5;
    z.set(zIndex + zVariation);
  });
  
  return (
    <m.div
      className="NoTouch NoMouse NoDrag"
      style={{
        x,
        y,
        translateZ: z,
        opacity: cloudOpacity,
        width: width,
        position: 'absolute',
        top: top,
        zIndex: zIndex
      }}
    >
      <Image 
        src={src}
        style={{ 
          width: '100%', 
          height: 'auto',
          position: 'absolute',
          top: '0'
        }} 
      />
    </m.div>
  );
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const getRandomViewHeight = (min: number, max: number) => `${getRandomInt(min, max)}vh`;
const getRandomViewWidth = (min: number, max: number) => `${getRandomInt(min, max)}vw`;

const generateCloudComponents = (
  numClouds: number, 
  durationRange: {min: number, max: number},
  widthRange: {min: number, max: number},
  topRange: {min: number, max: number},
  zIndexRange: {min: number, max: number},
  opacityRange: {min: number, max: number}
) => {
  return Array.from({ length: numClouds }, (_, index) => (
    <Cloud
      key={index}
      src={`/images/cloud_${index % 3 + 1}.png`}
      startX={`${-widthRange.max}px`}
      endX='100vw'
      yPositions={[0, getRandomInt(-50, 50), getRandomInt(-50, 50), getRandomInt(-50, 50), getRandomInt(-50, 50), getRandomInt(-50, 50)]}
      duration={getRandomInt(durationRange.min, durationRange.max)}
      delay={(index + getRandomInt(0, index)) / (getRandomInt(0, 100) / 100)}
      width={`${getRandomInt(widthRange.min, widthRange.max)}px`}
      top={getRandomViewHeight(topRange.min, topRange.max)}
      zIndex={getRandomInt(zIndexRange.min, zIndexRange.max)}
      opacity={getRandomFloat(opacityRange.min, opacityRange.max)}
    />
  ));
};

export default generateCloudComponents;