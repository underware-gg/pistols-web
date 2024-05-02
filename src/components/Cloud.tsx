import { motion as m } from 'framer-motion';
import { Image } from 'semantic-ui-react';

const Cloud = ({
  src,
  startX,
  endX,
  yPositions,
  duration,
  delay = 0,
  width = 500,
  top = 0,
  zIndex = 1
}: {
  src: string;
  startX: any;
  endX: string;
  yPositions: number[];
  duration: number;
  delay: number;
  width: any;
  top: any;
  zIndex: number
}) => {
  return (
    <m.div
      initial={{ x: startX, y: 0, opacity: 0.85, translateZ: zIndex }}
      animate={{ x: endX, y: yPositions, translateZ: zIndex }}
      transition={{
        x: { duration, repeat: Infinity, ease: 'linear', delay },
        y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
        translateZ: { duration, repeat: Infinity, ease: 'easeInOut', delay }
      }}
      style={{
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
const getRandomViewHeight = (min: number, max: number) => `${getRandomInt(min, max)}vh`;
const getRandomViewWidth = (min: number, max: number) => `${getRandomInt(min, max)}vw`;

const generateCloudComponents = (
  numClouds: number, 
  durationRange: {min: number, max: number},
  widthRange: {min: number, max: number},
  topRange: {min: number, max: number},
  zIndexRange: {min: number, max: number}
) => {
  return Array.from({ length: numClouds }, (_, index) => (
    <Cloud
      key={index}
      src={`/images/cloud${index % 3 + 1}.png`}
      startX={`${-widthRange.max}px`}
      endX='100vw'
      yPositions={[0, getRandomInt(-50, 50), getRandomInt(-50, 50), getRandomInt(-50, 50), getRandomInt(-50, 50), getRandomInt(-50, 50)]}
      duration={getRandomInt(durationRange.min, durationRange.max)}
      delay={(index + getRandomInt(0, index)) / (getRandomInt(0, 100) / 100)}
      width={`${getRandomInt(widthRange.min, widthRange.max)}px`}
      top={getRandomViewHeight(topRange.min, topRange.max)}
      zIndex={getRandomInt(zIndexRange.min, zIndexRange.max)}
    />
  ));
};

export default generateCloudComponents;