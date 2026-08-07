import spriteMetadata from "../../public/images/duelist/sprites/metadata.json";
import { motion as m, type HTMLMotionProps } from "framer-motion";
import NextImage from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type Duelist = "female" | "male";
type DuelistAnimation = "idle" | "twosteps" | "shoot";

type Atlas = (typeof spriteMetadata.atlases)[number];

const atlasDecodes = new Map<string, Promise<void>>();

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

function getPosterSource(duelist: Duelist, animation: DuelistAnimation, frame: number) {
  return `/images/duelist/${duelist}/${animation}/frame_${String(frame).padStart(3, '0')}.png`;
}

function decodeAtlas(source: string) {
  const existingDecode = atlasDecodes.get(source);
  if (existingDecode) return existingDecode;

  const image = new Image();
  const decode = image.decode?.bind(image);
  const atlasDecode = decode
    ? (() => {
        image.src = source;
        return decode().catch(() => undefined);
      })()
    : new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
        image.src = source;
      });

  atlasDecodes.set(source, atlasDecode);
  return atlasDecode;
}

/**
 * Starts fetching and decoding selected atlases without changing the visible
 * frame. Call this during a known lead time before an animation transition.
 */
export function preloadDuelistAnimations(animations: DuelistAnimation[]) {
  return Promise.all(
    spriteMetadata.atlases
      .filter((atlas) => animations.includes(atlas.animation as DuelistAnimation))
      .map((atlas) => decodeAtlas(atlas.src)),
  );
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
  const requestedFrameRef = useRef({ animation: initialAnimation, frame: initialFrame });
  const initialSprite = getSpriteStyle(duelist, initialAnimation, initialFrame);
  const [isInitialAtlasReady, setIsInitialAtlasReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void decodeAtlas(initialSprite.atlas.src).then(() => {
      if (isMounted) setIsInitialAtlasReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, [initialSprite.atlas.src]);

  useImperativeHandle(ref, () => ({
    setFrame(animation, frame) {
      const element = elementRef.current;
      const sprite = getSpriteStyle(duelist, animation, frame);
      currentFrameRef.current = { animation, frame: sprite.selectedFrame.frame };
      requestedFrameRef.current = { animation, frame: sprite.selectedFrame.frame };
      if (!element) return;

      const applyFrame = (nextAnimation: DuelistAnimation, nextFrame: number) => {
        const nextSprite = getSpriteStyle(duelist, nextAnimation, nextFrame);
        element.style.backgroundImage = nextSprite.style.backgroundImage;
        element.style.backgroundPosition = nextSprite.style.backgroundPosition;
        element.style.backgroundSize = nextSprite.style.backgroundSize;
        element.dataset.animation = nextAnimation;
        element.dataset.frame = String(nextSprite.selectedFrame.frame);
      };

      const currentSource = element.style.backgroundImage;
      if (currentSource.includes(sprite.atlas.src)) {
        applyFrame(animation, sprite.selectedFrame.frame);
        return;
      }

      void decodeAtlas(sprite.atlas.src).then(() => {
        const requestedFrame = requestedFrameRef.current;
        if (requestedFrame.animation !== animation) return;
        applyFrame(requestedFrame.animation, requestedFrame.frame);
      });
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
        position: "relative",
        width: "auto",
        aspectRatio: `${initialSprite.atlas.frame.width} / ${initialSprite.atlas.frame.height}`,
        backgroundImage: initialSprite.style.backgroundImage,
        backgroundPosition: initialSprite.style.backgroundPosition,
        backgroundRepeat: "no-repeat",
        backgroundSize: initialSprite.style.backgroundSize,
        ...style,
      }}
    >
      <NextImage
        src={getPosterSource(duelist, initialAnimation, initialSprite.selectedFrame.frame)}
        alt=""
        aria-hidden="true"
        width={initialSprite.atlas.frame.width}
        height={initialSprite.atlas.frame.height}
        loading="eager"
        unoptimized
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: isInitialAtlasReady ? 0 : 1,
          pointerEvents: "none",
          transition: "opacity 100ms ease-out",
        }}
      />
    </m.div>
  );
});
