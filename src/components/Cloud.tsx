import type { CSSProperties } from 'react';
import { Image } from 'semantic-ui-react';

type Range = {
  min: number;
  max: number;
};

type CloudStyle = CSSProperties & {
  '--cloud-duration': string;
  '--cloud-delay': string;
  '--cloud-opacity': number;
  '--cloud-depth': string;
  '--cloud-rest-x': string;
  '--cloud-x-0': string;
  '--cloud-x-1': string;
  '--cloud-x-2': string;
  '--cloud-x-3': string;
  '--cloud-x-4': string;
  '--cloud-x-5': string;
  '--cloud-x-6': string;
  '--cloud-y-0': string;
  '--cloud-y-1': string;
  '--cloud-y-2': string;
  '--cloud-y-3': string;
  '--cloud-y-4': string;
  '--cloud-y-5': string;
};

type CloudProps = {
  src: string;
  style: CloudStyle;
};

const Cloud = ({ src, style }: CloudProps) => (
  <div className="LandingCloud NoTouch NoMouse NoDrag" style={style} aria-hidden="true">
    <Image className="LandingCloud__image" src={src} alt="" draggable={false} />
  </div>
);

const getRandomInt = ({ min, max }: Range) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomFloat = ({ min, max }: Range) =>
  Math.random() * (max - min) + min;

const getHorizontalPosition = (startXPx: number, progress: number) =>
  `calc(${startXPx * (1 - progress)}px + ${progress * 100}vw)`;

const generateCloudComponents = (
  numClouds: number,
  durationRange: Range,
  widthRange: Range,
  topRange: Range,
  zIndexRange: Range,
  opacityRange: Range
) => Array.from({ length: numClouds }, (_, index) => {
  const duration = getRandomInt(durationRange);
  const startX = -widthRange.max;
  const zIndex = getRandomInt(zIndexRange);
  const yPositions = Array.from({ length: 6 }, (_, yIndex) =>
    yIndex === 0 ? 0 : getRandomInt({ min: -50, max: 50 })
  );
  const progressPoints = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
  const horizontalPositions = progressPoints.map((progress) =>
    getHorizontalPosition(startX, progress)
  );

  const style: CloudStyle = {
    '--cloud-duration': `${duration}s`,
    '--cloud-delay': `${-getRandomFloat({ min: 0, max: duration })}s`,
    '--cloud-opacity': getRandomFloat(opacityRange),
    '--cloud-depth': `${zIndex}px`,
    '--cloud-rest-x': `${getRandomInt({ min: -10, max: 90 })}vw`,
    '--cloud-x-0': horizontalPositions[0],
    '--cloud-x-1': horizontalPositions[1],
    '--cloud-x-2': horizontalPositions[2],
    '--cloud-x-3': horizontalPositions[3],
    '--cloud-x-4': horizontalPositions[4],
    '--cloud-x-5': horizontalPositions[5],
    '--cloud-x-6': horizontalPositions[6],
    '--cloud-y-0': `${yPositions[0]}px`,
    '--cloud-y-1': `${yPositions[1]}px`,
    '--cloud-y-2': `${yPositions[2]}px`,
    '--cloud-y-3': `${yPositions[3]}px`,
    '--cloud-y-4': `${yPositions[4]}px`,
    '--cloud-y-5': `${yPositions[5]}px`,
    width: `${getRandomInt(widthRange)}px`,
    top: `${getRandomInt(topRange)}vh`,
    zIndex
  };

  return <Cloud key={index} src={`/images/cloud_${index % 3 + 1}.png`} style={style} />;
});

export default generateCloudComponents;
