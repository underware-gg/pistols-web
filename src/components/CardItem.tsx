import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Img from 'next/image';

const Carditem = ({ 
  image, 
  height,
  width, 
  margin,
  onMouseEnter, 
  onMouseLeave 
}: { 
  image: string,
  height: number, 
  width: number, 
  margin: number, 
  onMouseEnter: any, 
  onMouseLeave: any 
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
    };
    img.src = image;
  }, []);

  return (
    <motion.div
      className="relative-container"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onHoverStart={() => setShowOverlay(true)}
      onHoverEnd={() => setShowOverlay(false)}
      whileHover={{ scale: 1.5, zIndex: 100, width: height * aspectRatio, height: height }}
      style={{ margin: `0 ${margin}px`, height: height, width: height / 1.7778, filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.4))' }}
    >
      <AnimatePresence>
        {showOverlay && (
          <motion.div className="absolute-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="background-black" />
            <motion.h1 className="explore-now" initial={{ y: 10 }} animate={{ y: 0 }} exit={{ y: 10 }}>
              Explore Now
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
      <Img src={image} alt="" fill style={{ objectFit: 'cover' }} />
    </motion.div>
  );
};

export default Carditem;
