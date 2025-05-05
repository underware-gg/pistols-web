import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import styles from "./styles.module.scss";
import { motion, useAnimation } from "framer-motion";

export const BreakingButton = forwardRef(({
  title,
  style,
  onClick,
}: {
  title: string;
  style: any;
  onClick: () => {};
}, ref) => {
  const controls = useAnimation();
  const controlsText = useAnimation();
  const controlsTextBox = useAnimation();
  const controlsFlash = useAnimation();
  
  function breakButton() {
    controls.start(i => ({
      x: brokenPieces[i].animation.x,
      y: brokenPieces[i].animation.y,
      rotate: brokenPieces[i].animation.rotate,
      opacity: brokenPieces[i].animation.opacity,
      transition: { duration: 1.3, times: [0, 0.1, 1], ease: ["circIn", "easeOut"] },
    }));
    controlsTextBox.start({
      x: brokenPieces[0].animation.x,
      y: brokenPieces[0].animation.y,
      rotate: brokenPieces[0].animation.rotate,
      opacity: brokenPieces[0].animation.opacity,
      transition: { duration: 1.3, times: [0, 0.1, 1], ease: ["circIn", "easeOut"] },
    });
    controlsFlash.start(i => ({
      x: brokenPieces[i].animation.x,
      y: brokenPieces[i].animation.y,
      rotate: brokenPieces[i].animation.rotate,
      opacity: [0, 0.8, 0],
      transition: { duration: 1.3, times: [0, 0.1, 1], ease: ["circIn", "easeOut"] },
    }));
  };

  useImperativeHandle(ref, () => ({
    breakButton,
  }));

  const brokenPieces = [
    {
      className: styles.button_broken,
      src: "/images/buttonpieces/button_broken.svg",
      alt: "button_broken",
      animation: {
        x: [0, 0, 0],
        y: [0, 0, 0],
        rotate: [0, -2, 5],
				opacity: [0, 1, 1]
      },
      hover: { scale: 1.05, filter: "brightness(1.1)" },
      onHoverStart: () => controlsText.start({ scale: 1.07 }),
      onHoverEnd: () => controlsText.start({ scale: 1 })
    },
    {
      className: styles.break_left_07,
      src: "/images/buttonpieces/break_left_07.svg",
      alt: "break_left_07",
      animation: {
        x: [0, -3, -15],
        y: [0, 2, -7],
        rotate: [0, -2, -8],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_left_06,
      src: "/images/buttonpieces/break_left_06.svg",
      alt: "break_left_06",
      animation: {
        x: [0, -1, -20],
        y: [0, 2, 4],
        rotate: [0, -2, -34],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_left_05,
      src: "/images/buttonpieces/break_left_05.svg",
      alt: "break_left_05",
      animation: {
        x: [0, -10, -42],
        y: [0, -4, -32],
        rotate: [0, 0, -15],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_left_04,
      src: "/images/buttonpieces/break_left_04.svg",
      alt: "break_left_04",
      animation: {
        x: [0, 0, -12],
        y: [0, 4, -6],
        rotate: [0, 2, 48],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_left_03,
      src: "/images/buttonpieces/break_left_03.svg",
      alt: "break_left_03",
      animation: {
        x: [0, -4, -44],
        y: [0, 3, 9],
        rotate: [0, -2, -48],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_left_02,
      src: "/images/buttonpieces/break_left_02.svg",
      alt: "break_left_02",
      animation: {
        x: [0, -4, -30],
        y: [0, 2, 3],
        rotate: [0, -2, -98],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_left_01,
      src: "/images/buttonpieces/break_left_01.svg",
      alt: "break_left_01",
      animation: {
        x: [0, -10, -28],
        y: [0, 2, -14],
        rotate: [0, 4, 13],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_right_07,
      src: "/images/buttonpieces/break_right_07.svg",
      alt: "break_right_07",
      animation: {
        x: [0, 2, 18],
        y: [0, -3, 7],
        rotate: [0, -1, -6],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_right_06,
      src: "/images/buttonpieces/break_right_06.svg",
      alt: "break_right_06",
      animation: {
        x: [0, 4, 38],
        y: [0, -5, -2],
        rotate: [0, 0, 18],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_right_05,
      src: "/images/buttonpieces/break_right_05.svg",
      alt: "break_right_05",
      animation: {
        x: [0, 1, 34],
        y: [0, -1, 29],
        rotate: [0, 1, 17],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_right_04,
      src: "/images/buttonpieces/break_right_04.svg",
      alt: "break_right_04",
      animation: {
        x: [0, 0, 4],
        y: [0, -2, 5],
        rotate: [0, -1, -23],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_right_03,
      src: "/images/buttonpieces/break_right_03.svg",
      alt: "break_right_03",
      animation: {
        x: [0, 6, 58],
        y: [0, -4, -2],
        rotate: [0, 0, 28],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_right_02,
      src: "/images/buttonpieces/break_right_02.svg",
      alt: "break_right_02",
      animation: {
        x: [0, 6, 40],
        y: [0, -5, 12],
        rotate: [0, 0, 128],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.break_right_01,
      src: "/images/buttonpieces/break_right_01.svg",
      alt: "break_right_01",
      animation: {
        x: [0, 4, 15],
        y: [0, -2, 11],
        rotate: [0, 2, 8],
				opacity: [1, 1, 1]
      }
    },
    {
      className: styles.button,
      src: "/images/buttonpieces/button.svg",
      alt: "button",
      animation: {
        x: [0, 0, -200],
        y: [0, 0, 0],
        rotate: [0, 0, 0],
				opacity: [1, 0, 0]
      },
      hover: { scale: 1.05, filter: "brightness(1.1)" },
      onHoverStart: () => controlsText.start({ scale: 1.07 }),
      onHoverEnd: () => controlsText.start({ scale: 1 })
    },
  ];

  return (
    <div ref={ref} style={style} className={styles.container} onClick={onClick}>
      {brokenPieces.map((piece, index) => (
        <motion.img
          key={index}
          className={piece.className}
          src={piece.src}
          alt={piece.alt}
          animate={controls}
          custom={index}
          whileHover={piece.hover}
          onHoverStart={piece.onHoverStart}
          onHoverEnd={piece.onHoverEnd}
        />
      ))}
      <motion.div
        style={{ zIndex: 10, pointerEvents: 'none' }}
        animate={controlsTextBox}
      >
        <motion.h2 className="Black" style={{ fontSize: 'min(3.4vh, 6.4vmin)' }} animate={controlsText}>{title}</motion.h2>
      </motion.div>
      {brokenPieces.slice(0, -1).map((piece, index) => (
        <motion.img
          key={100 + index}
          className={piece.className}
          src={piece.src}
          alt={`${piece.alt}_2`}
          animate={controlsFlash}
          custom={index}
          style={{ filter: 'brightness(2) drop-shadow(0px 0px 10px #FFFF)', zIndex: 9, opacity: 0, pointerEvents: 'none' }}
        />
      ))}
    </div>
  );
});