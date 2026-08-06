import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from 'react';

type ViewportVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  'autoPlay' | 'loop' | 'muted' | 'playsInline' | 'preload' | 'src'
> & {
  /** The only source is attached once this video approaches the viewport. */
  src: string;
  /** Start loading shortly before the video is visible, in CSS margin syntax. */
  rootMargin?: string;
};

/**
 * A decorative looping video that avoids downloading or decoding until it is
 * near the viewport, and releases decoder work whenever it leaves view.
 */
const ViewportVideo = forwardRef<HTMLVideoElement, ViewportVideoProps>(
  ({ rootMargin = '200px 0px', src, ...videoProps }, forwardedRef) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isInViewport, setIsInViewport] = useState(false);

    useImperativeHandle(forwardedRef, () => videoRef.current as HTMLVideoElement);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // IntersectionObserver is absent only in legacy browsers. In that case,
      // retaining the normal eager-video behaviour is the safe fallback.
      if (!('IntersectionObserver' in window)) {
        setHasLoaded(true);
        setIsInViewport(true);
        return;
      }

      const loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasLoaded(true);
            loadObserver.disconnect();
          }
        },
        { rootMargin }
      );
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        setIsInViewport(entry.isIntersecting);
      });

      loadObserver.observe(video);
      visibilityObserver.observe(video);
      return () => {
        loadObserver.disconnect();
        visibilityObserver.disconnect();
      };
    }, [rootMargin]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !hasLoaded) return;

      video.load();
    }, [hasLoaded, src]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !hasLoaded) return;

      if (!isInViewport) {
        video.pause();
        return;
      }

      // Autoplay can be rejected by a browser despite muted + playsInline;
      // that does not need to surface as an unhandled promise rejection.
      void video.play().catch(() => undefined);
    }, [hasLoaded, isInViewport]);

    return (
      <video
        {...videoProps}
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        src={hasLoaded ? src : undefined}
      />
    );
  }
);

ViewportVideo.displayName = 'ViewportVideo';

export type { ViewportVideoProps };
export default ViewportVideo;
