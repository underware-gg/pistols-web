import spriteMetadata from "../../public/images/duelist/sprites/metadata.json";
import { motion as m, type HTMLMotionProps } from "framer-motion";
import { forwardRef, useImperativeHandle, useRef } from "react";

type Duelist = "female" | "male";
type DuelistAnimation = "idle" | "twosteps" | "shoot";

type Atlas = (typeof spriteMetadata.atlases)[number];

export type DuelistSpriteProps = Omit<HTMLMotionProps<"div">, "children"> & {
  duelist: Duelist;
  initialAnimation: DuelistAnimation;
  initialFrame: number;
  alt: string;
};

export type DuelistSpriteHandle = {
  setFrame: (animation: DuelistAnimation, frame: number) => void;
  getElement: () => HTMLDivElement | null;
  getFrame: () => Readonly<{ animation: DuelistAnimation; frame: number }>;
};

function findAtlas(duelist: Duelist, animation: DuelistAnimation): Atlas {
  const atlas = spriteMetadata.atlases.find((candidate) => candidate.duelist === duelist && candidate.animation === animation);
  if (!atlas) throw new Error(`Missing duelist sprite atlas: ${duelist}/${animation}`);
  return atlas;
}

function resolveFrame(atlas: Atlas, frame: number) {
  return atlas.frames.find((candidate) => candidate.frame === frame) ?? atlas.frames[0];
}

function getSpriteStyle(duelist: Duelist, animation: DuelistAnimation, frame: number) {
  const atlas = findAtlas(duelist, animation);
  const selectedFrame = resolveFrame(atlas, frame);
  const positionX = atlas.atlas.columns === 1 ? 0 : (selectedFrame.column / (atlas.atlas.columns - 1)) * 100;
  const positionY = atlas.atlas.rows === 1 ? 0 : (selectedFrame.row / (atlas.atlas.rows - 1)) * 100;
  return {
    atlas,
    selectedFrame,
    style: {
      backgroundImage: `url(${atlas.src})`,
      backgroundPosition: `${positionX}% ${positionY}%`,
      backgroundSize: `${atlas.atlas.columns * 100}% ${atlas.atlas.rows * 100}%`,
    },
  };
}

/**
 * A motion-compatible, single-element duelist frame.
 *
 * The parent controls animation timing and merely updates `frame`, matching the
 * existing scroll-driven frame-selection rules without assigning image sources.
 */
export const DuelistSprite = forwardRef<DuelistSpriteHandle, DuelistSpriteProps>(function DuelistSprite(
  { duelist, initialAnimation, initialFrame, alt, style, ...motionProps },
  ref,
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const currentFrameRef = useRef({ animation: initialAnimation, frame: initialFrame });
  const initialSprite = getSpriteStyle(duelist, initialAnimation, initialFrame);

  useImperativeHandle(ref, () => ({
    setFrame(animation, frame) {
      const element = elementRef.current;
      const sprite = getSpriteStyle(duelist, animation, frame);
      currentFrameRef.current = { animation, frame: sprite.selectedFrame.frame };
      if (!element) return;
      element.style.backgroundImage = sprite.style.backgroundImage;
      element.style.backgroundPosition = sprite.style.backgroundPosition;
      element.style.backgroundSize = sprite.style.backgroundSize;
      element.dataset.animation = animation;
      element.dataset.frame = String(sprite.selectedFrame.frame);
    },
    getElement: () => elementRef.current,
    getFrame: () => currentFrameRef.current,
  }), [duelist]);

  return (
    <m.div
      {...motionProps}
      ref={elementRef}
      role="img"
      aria-label={alt}
      data-animation={initialAnimation}
      data-frame={initialSprite.selectedFrame.frame}
      style={{
        display: "inline-block",
        width: "auto",
        aspectRatio: `${initialSprite.atlas.frame.width} / ${initialSprite.atlas.frame.height}`,
        backgroundImage: initialSprite.style.backgroundImage,
        backgroundPosition: initialSprite.style.backgroundPosition,
        backgroundRepeat: "no-repeat",
        backgroundSize: initialSprite.style.backgroundSize,
        ...style,
      }}
    />
  );
});
