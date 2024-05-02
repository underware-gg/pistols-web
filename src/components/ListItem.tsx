import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Img from 'next/image';

const ListItem = ({ 
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
      whileHover={{ scale: 2, zIndex: 100, width: height * aspectRatio, height: height }}
      style={{ margin: `0 ${margin}px`, height: height, width: width, filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.39))' }}
    >
      <Img src={image} alt="" fill style={{ objectFit: 'cover' }} />
    </motion.div>
  );
};

export default ListItem;
