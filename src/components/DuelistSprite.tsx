import spriteMetadata from "../../public/images/duelist/sprites/metadata.json";
import { motion as m, type HTMLMotionProps } from "framer-motion";
import NextImage from "next/image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

type Duelist = "female" | "male";
type DuelistAnimation = "idle" | "twosteps" | "shoot";

type Atlas = (typeof spriteMetadata.atlases)[number];

const atlasReadiness = new Map<string, Promise<boolean>>();

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

function getSprite(duelist: Duelist, animation: DuelistAnimation, frame: number) {
  const atlas = findAtlas(duelist, animation);
  return { atlas, selectedFrame: resolveFrame(atlas, frame) };
}

function getPosterSource(duelist: Duelist, animation: DuelistAnimation, frame: number) {
  return `/images/duelist/${duelist}/${animation}/frame_${String(frame).padStart(3, "0")}.png`;
}

function prepareAtlas(source: string) {
  const existingReadiness = atlasReadiness.get(source);
  if (existingReadiness) return existingReadiness;

  const image = new Image();
  const loaded = new Promise<boolean>((resolve) => {
    image.addEventListener("load", () => resolve(true), { once: true });
    image.addEventListener("error", () => resolve(false), { once: true });
  });

  image.src = source;
  const decoded = image.decode ? image.decode().then(() => true, () => false) : Promise.resolve(true);
  const readiness = Promise.all([loaded, decoded]).then(([didLoad, didDecode]) => {
    const isReady = didLoad && didDecode;
    if (!isReady) atlasReadiness.delete(source);
    return isReady;
  });

  atlasReadiness.set(source, readiness);
  return readiness;
}

function decodeImage(image: HTMLImageElement) {
  return image.decode ? image.decode().then(() => true, () => false) : Promise.resolve(true);
}

function loadRenderedAtlas(image: HTMLImageElement, source: string) {
  return new Promise<boolean>((resolve) => {
    let settled = false;

    const finish = (didLoad: boolean) => {
      if (settled) return;
      settled = true;
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      if (!didLoad) {
        resolve(false);
        return;
      }
      void decodeImage(image).then(resolve);
    };
    const handleLoad = () => finish(true);
    const handleError = () => finish(false);

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    const hasFailedSource = image.getAttribute("src") === source && image.complete && image.naturalWidth === 0;
    if (image.getAttribute("src") !== source || hasFailedSource) {
      // Reassign a broken complete image so a later transition can retry it.
      if (hasFailedSource) image.removeAttribute("src");
      image.src = source;
    }

    if (image.complete && image.naturalWidth > 0) finish(true);
  });
}

function positionAtlasFrame(image: HTMLImageElement, atlas: Atlas, column: number, row: number) {
  image.style.width = `${atlas.atlas.columns * 100}%`;
  image.style.height = `${atlas.atlas.rows * 100}%`;
  image.style.transform = `translate3d(-${(column / atlas.atlas.columns) * 100}%, -${(row / atlas.atlas.rows) * 100}%, 0)`;
}

/** Starts fetching and decoding selected atlases without changing the visible frame. */
export function preloadDuelistAnimations(animations: DuelistAnimation[]) {
  return Promise.all(
    spriteMetadata.atlases
      .filter((atlas) => animations.includes(atlas.animation as DuelistAnimation))
      .map((atlas) => prepareAtlas(atlas.src)),
  );
}

/**
 * Displays atlas frames without replacing an image on every animation tick.
 * Two rendered atlas layers make animation changes atomic: the old layer stays
 * visible until the incoming layer itself has loaded and decoded.
 */
export const DuelistSprite = forwardRef<DuelistSpriteHandle, DuelistSpriteProps>(function DuelistSprite(
  { duelist, initialAnimation, initialFrame, alt, style, ...motionProps },
  ref,
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const atlasImageRefs = useRef<Array<HTMLImageElement | null>>([null, null]);
  const activeSlotRef = useRef(0);
  const activeAtlasSourceRef = useRef(findAtlas(duelist, initialAnimation).src);
  const pendingAtlasSourceRef = useRef<string | null>(null);
  const requestVersionRef = useRef(0);
  const currentFrameRef = useRef({ animation: initialAnimation, frame: initialFrame });
  const requestedFrameRef = useRef({ animation: initialAnimation, frame: initialFrame });
  const initialSprite = getSprite(duelist, initialAnimation, initialFrame);
  const [isInitialAtlasReady, setIsInitialAtlasReady] = useState(false);

  useEffect(() => {
    const image = atlasImageRefs.current[0];
    if (!image) return;

    let isMounted = true;
    const expectedSource = findAtlas(duelist, initialAnimation).src;
    void loadRenderedAtlas(image, expectedSource).then((isReady) => {
      if (isMounted && isReady && image.getAttribute("src") === expectedSource) {
        setIsInitialAtlasReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [duelist, initialAnimation]);

  const applyFrame = useCallback((
    image: HTMLImageElement,
    animation: DuelistAnimation,
    frame: number,
  ) => {
    const sprite = getSprite(duelist, animation, frame);
    positionAtlasFrame(image, sprite.atlas, sprite.selectedFrame.column, sprite.selectedFrame.row);
    const element = elementRef.current;
    if (element) {
      element.dataset.animation = animation;
      element.dataset.frame = String(sprite.selectedFrame.frame);
    }
    currentFrameRef.current = { animation, frame: sprite.selectedFrame.frame };
  }, [duelist]);

  useImperativeHandle(ref, () => ({
    setFrame(animation, frame) {
      const sprite = getSprite(duelist, animation, frame);
      requestedFrameRef.current = { animation, frame: sprite.selectedFrame.frame };
      const activeImage = atlasImageRefs.current[activeSlotRef.current];
      if (!activeImage) return;

      if (activeAtlasSourceRef.current === sprite.atlas.src) {
        requestVersionRef.current += 1;
        pendingAtlasSourceRef.current = null;
        const stagingImage = atlasImageRefs.current[1 - activeSlotRef.current];
        if (stagingImage) stagingImage.style.opacity = "0";
        applyFrame(activeImage, animation, sprite.selectedFrame.frame);
        return;
      }

      if (pendingAtlasSourceRef.current === sprite.atlas.src) return;

      const stagingSlot = 1 - activeSlotRef.current;
      const stagingImage = atlasImageRefs.current[stagingSlot];
      if (!stagingImage) return;

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;
      pendingAtlasSourceRef.current = sprite.atlas.src;
      stagingImage.style.opacity = "0";
      positionAtlasFrame(stagingImage, sprite.atlas, sprite.selectedFrame.column, sprite.selectedFrame.row);

      void loadRenderedAtlas(stagingImage, sprite.atlas.src).then((isReady) => {
        if (requestVersionRef.current !== requestVersion) return;
        if (!isReady) {
          pendingAtlasSourceRef.current = null;
          return;
        }

        const requestedFrame = requestedFrameRef.current;
        const requestedSprite = getSprite(duelist, requestedFrame.animation, requestedFrame.frame);
        if (requestedSprite.atlas.src !== sprite.atlas.src) return;

        positionAtlasFrame(
          stagingImage,
          requestedSprite.atlas,
          requestedSprite.selectedFrame.column,
          requestedSprite.selectedFrame.row,
        );
        stagingImage.style.opacity = "1";
        activeImage.style.opacity = "0";
        stagingImage.dataset.duelistAtlasLayer = "active";
        activeImage.dataset.duelistAtlasLayer = "staging";
        activeSlotRef.current = stagingSlot;
        activeAtlasSourceRef.current = sprite.atlas.src;
        pendingAtlasSourceRef.current = null;
        applyFrame(stagingImage, requestedFrame.animation, requestedSprite.selectedFrame.frame);
        setIsInitialAtlasReady(true);

        const retiredSource = activeImage.getAttribute("src");
        requestAnimationFrame(() => {
          if (
            activeSlotRef.current !== 1 - stagingSlot
            && activeImage.style.opacity === "0"
            && activeImage.getAttribute("src") === retiredSource
          ) {
            activeImage.removeAttribute("src");
          }
        });
      });
    },
    getElement: () => elementRef.current,
    getFrame: () => currentFrameRef.current,
  }), [applyFrame, duelist]);

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
        overflow: "hidden",
        width: "auto",
        aspectRatio: `${initialSprite.atlas.frame.width} / ${initialSprite.atlas.frame.height}`,
        ...style,
      }}
    >
      {[0, 1].map((slot) => (
        // eslint-disable-next-line @next/next/no-img-element -- A rendered native image is required to make atlas readiness and handoff atomic.
        <img
          key={slot}
          ref={(image) => { atlasImageRefs.current[slot] = image; }}
          src={slot === 0 ? initialSprite.atlas.src : undefined}
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          data-duelist-atlas-layer={slot === 0 ? "active" : "staging"}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            maxWidth: "none",
            objectFit: "fill",
            pointerEvents: "none",
            opacity: slot === 0 ? 1 : 0,
            willChange: "transform",
            ...(slot === 0 ? {
              width: `${initialSprite.atlas.atlas.columns * 100}%`,
              height: `${initialSprite.atlas.atlas.rows * 100}%`,
              transform: `translate3d(-${(initialSprite.selectedFrame.column / initialSprite.atlas.atlas.columns) * 100}%, -${(initialSprite.selectedFrame.row / initialSprite.atlas.atlas.rows) * 100}%, 0)`,
            } : undefined),
          }}
        />
      ))}
      <NextImage
        src={getPosterSource(duelist, initialAnimation, initialSprite.selectedFrame.frame)}
        alt=""
        aria-hidden="true"
        width={initialSprite.atlas.frame.width}
        height={initialSprite.atlas.frame.height}
        loading="eager"
        unoptimized
        decoding="async"
        data-duelist-poster
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
