import React, { useEffect, useMemo, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import ListItem from './ListItem';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import Carditem from './CardItem';

enum ScrollDirection {
  LEFT,
  RIGHT
}

const InfiniteHorizontalScroll = ({ 
  images, 
  direction, 
  imageHeight,
  imageWidth,
  isContentCard = false
}: { 
  images: string[], 
  direction: ScrollDirection, 
  imageHeight: string,
  imageWidth: string,
  isContentCard: boolean
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [isHovering, setIsHovering] = useState(false);
  const [isInsideElement, setIsInsideElement] = useState(false);

  const [mustFinish, setMustFinish] = useState(false);
  const [rerender, setRerender] = useState(false);

  const { width, height } = useWindowDimensions();
  const startingPosition = useMotionValue(0);
  const xTranslation = useMotionValue(0);
  const finalPosition = useMotionValue(0);
  const oppositeFinalPosition = useMotionValue(0);
  
  const duration = useMotionValue(0);

  const preloadedImages = useMemo(() => {
    if (!hasMounted) {
      return [];
    }

    let margin: number;
    if (isContentCard) {
      margin = 28
    } else {
      margin = 8
    }

    const durationMultiplier = 2 // seconds per image

    const heightMultiplier = imageHeight.includes('vh') ? height : width
    const widthMultiplier = imageWidth.includes('vh') ? height : width
    const imageHeightNumber = heightMultiplier * (parseInt((imageHeight.match(/\d+/) ?? ['50'])[0]) / 100)
    const imageWidthNumber = widthMultiplier * (parseInt((imageWidth.match(/\d+/) ?? ['50'])[0]) / 100)

    const imageNumber = Math.ceil(width / imageHeightNumber)
    let newImages: string[] = [...images];
    let pageSize = 0;
    if (images.length < imageNumber) {
      const repeatCount = Math.ceil(imageNumber / images.length)
      for (let i = 0; i < (repeatCount * 3) - 1; i++) {
        newImages = [...newImages, ...images]
      }
      pageSize = repeatCount * images.length * (imageWidthNumber + (margin * 2))
      duration.set(repeatCount * images.length * durationMultiplier)
    } else {
      newImages = [...newImages, ...images, ...images]
      pageSize = images.length * (imageWidthNumber + (margin * 2))
      duration.set(images.length * durationMultiplier)
    }

    startingPosition.set(-pageSize)
    xTranslation.set(-pageSize)
    if (direction == ScrollDirection.LEFT) {
      finalPosition.set(-pageSize * 2)
      oppositeFinalPosition.set(0)
    } else {
      finalPosition.set(0)
      oppositeFinalPosition.set(-pageSize * 2)
    }

    return newImages.map((item, index) => {
      if (isContentCard) {
        return (
          <Carditem
            image={item}
            height={imageHeightNumber}
            width={imageWidthNumber}
            margin={margin}
            key={index}
            onMouseEnter={() => {
              setIsHovering(true)
              setMustFinish(true)
            }}
            onMouseLeave={() => {
              setIsHovering(false)
              setMustFinish(true)
            }}
          />
        );
      } else {
        return (
          <ListItem
            image={item}
            height={imageHeightNumber}
            width={imageWidthNumber}
            margin={margin}
            key={index}
            onMouseEnter={() => {
              setIsHovering(true)
              setMustFinish(true)
            }}
            onMouseLeave={() => {
              setIsHovering(false)
              setMustFinish(true)
            }}
          />
        );
      }
    });
  }, [hasMounted, width, height]);

  useEffect(() => {
    let controls: any;

    if (!isHovering) {
      if (mustFinish) {
        controls = animate(xTranslation, [xTranslation.get(), finalPosition.get()], {
          ease: "linear",
          duration: duration.get() * (1 - ((xTranslation.get() - startingPosition.get()) / (finalPosition.get() - startingPosition.get()))),
          onComplete: () => {
            setMustFinish(false);
            setRerender(!rerender);
          },
        });
      } else {
        controls = animate(xTranslation, [startingPosition.get(), finalPosition.get()], {
          ease: "linear",
          duration: duration.get(),
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 0,
        });
      }
    }

    return () => controls?.stop();
  }, [rerender, isHovering, width, height]);

  const handleWheel = (event: any) => {
    if (Number.isNaN(xTranslation.get())) return
    if (isInsideElement) {
      let newX = xTranslation.get() + event.deltaX;
      if (direction == ScrollDirection.LEFT) {
        if (newX <= finalPosition.get() || newX >= oppositeFinalPosition.get()) {
          newX = startingPosition.get()
        }
      } else {
        if (newX <= oppositeFinalPosition.get() || newX >= finalPosition.get()) {
          newX = startingPosition.get()
        }
      }

      xTranslation.set(newX);
    }
  };

  return (
    <div style={{ display: 'flex', overflowX: 'auto', padding: '32px 0', overflow: 'visible', flex: 1, alignItems: 'center' }} onWheel={handleWheel}>
      <motion.div style={{ display: 'flex', x: xTranslation, overflow: 'visible' }} whileHover={{ zIndex: 100 }} onMouseEnter={() => setIsInsideElement(true)} onMouseLeave={() => setIsInsideElement(false)}>
        {preloadedImages}
      </motion.div>
    </div>
  );
  
};

export { InfiniteHorizontalScroll, ScrollDirection };