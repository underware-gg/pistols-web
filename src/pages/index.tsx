import App from "@/components/App";
import { BreakingButton } from "@/components/breakingbutton/BreakingButton";
import generateCloudComponents from "@/components/Cloud";
import { MouseToolTip } from "@/components/MouseToolTip";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { smoothScrollToPercentage } from "@/utils/smoothScroll";
import { animate, easeIn, easeInOut, easeOut, motion as m, useAnimationControls, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image as Img } from "semantic-ui-react";
import ParagraphWrapper from '../components/ParagraphWrapper';
import SelectDuelistModal from "@/components/SelectDuelistModal";
import * as TWEEN from '@tweenjs/tween.js'

export default function Home() {
  const smoothScroll = useSmoothScroll();
  const { width: displayWidth, height: displayHeight } = useWindowDimensions();

  const backgroundImageRef = useRef<any>(null);
  const introBlockRef = useRef<any>(null);
  const duelistRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shotSoundRef = useRef<HTMLAudioElement>(null);
  const breakSoundRef = useRef<HTMLAudioElement>(null);
  const breakButtonRef = useRef<any>(null);
  const breakButtonContainerRef = useRef<any>(null);

  const [backgroundHeight, setBackgroundHeight] = useState(0);
  const [maleDuelistSrc, setMaleDuelistSrc] = useState('/images/duelist/male/idle/frame_001.png');
  const [femaleDuelistSrc, setFemaleDuelistSrc] = useState('/images/duelist/female/idle/frame_001.png');
  const [isIdle, setIsIdle] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [disablePointer, setDisablePointer] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasBroken, setHasBroken] = useState(false);
  const [tooltipText, setTooltipText] = useState<string | null>(null);

  const [backgroundShift, setBackgroundShift] = useState(-78);
  const [duelistShift, setDuelistShift] = useState(0);
  const [buttonEnterShift, setButtonEnterShift] = useState(0);
  const [buttonScale, setButtonScale] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  // Add a computed value to check if the male duelist is currently in idle animation
  const isMaleIdle = useMemo(() => maleDuelistSrc.includes('/idle/'), [maleDuelistSrc]);

  // Add animation loop for TWEEN updates
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = (time?: number) => {
      animationFrameId = requestAnimationFrame(animate);
      TWEEN.update(time);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // Force instant scroll to top when page loads
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.documentElement.style.setProperty('--scrollbar-compensation', `${scrollbarWidth / 2}px`);
    }
    setIsMuted(JSON.parse(localStorage.getItem('isMuted') ?? 'false') === true);
  }, []);

  useEffect(() => {
    setDuelistShift(0.18 * backgroundImageRef.current.clientHeight);

    let newHeight = displayHeight - (0.5 * backgroundImageRef.current.clientHeight);
    newHeight = newHeight < 0 ? 0 : newHeight
    setBackgroundHeight(newHeight);


    let newShift = newHeight + backgroundImageRef.current.clientHeight - displayHeight;
    let offset = 0;
    if (displayHeight / backgroundImageRef.current.clientHeight < 0.3) {
      offset = ((0.24 * backgroundImageRef.current.clientHeight) - (displayHeight / 2))
    }
    newShift -= offset;
    setBackgroundShift(-newShift);

    setButtonEnterShift(displayHeight - (duelistShift + (0.65 * duelistRef.current.clientHeight) + (breakButtonContainerRef.current.clientHeight / 2) - offset));

    if (displayWidth < displayHeight) {
      var scaleBasedOnAspectRatio = 0.6 * (displayWidth / displayHeight) + 0.4;
      var scaleBasedOnWidth = displayWidth / 1400;
      setButtonScale(Math.max(scaleBasedOnAspectRatio, scaleBasedOnWidth));
    } else {
      setButtonScale(1);
    }

    if (window) {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }

      if (window.innerWidth < 1100) {
        setIsNarrow(true);
      } else {
        setIsNarrow(false);
      }

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-compensation', `${scrollbarWidth / 2}px`);
      setScrollbarWidth(scrollbarWidth);
    }
  }, [displayHeight, displayWidth]);

  const overlayControls = useAnimationControls();
  const textOverlayControls = useAnimationControls();
  const lineOverlayControls = useAnimationControls();
  const diamondOverlayControls = useAnimationControls();

  const { scrollYProgress } = useScroll();
  const { scrollYProgress: introScrollYProgress } = useScroll({ target: introBlockRef});
  const backgroundTransformY = useTransform(scrollYProgress, [0, 0.15], [0, backgroundShift], {ease: easeInOut});
  
  const walkStart = 0.09
  const walkEnd = 0.89
  const buttonEnterEnd = 0.94
  const shootEnd = 1
  const duelistWalk = useTransform(scrollYProgress, (value) => {
    if (hasBroken) return '38vw';
    return value <= walkStart ? '0vw' : value >= walkEnd ? '38vw' : `${(value - walkStart) / (walkEnd - walkStart) * 38}vw`;
  });
  const duelistShoot = useTransform(scrollYProgress, [walkEnd, shootEnd], [0, 1]);
  const buttonEnter = useTransform(scrollYProgress, [walkEnd, buttonEnterEnd], [1.1 * displayHeight, buttonEnterShift], {ease: easeIn});
  const buttonExit = useTransform(scrollYProgress, [buttonEnterEnd, shootEnd], ['0vh', '-15vh'], {ease: easeOut});
  
  
  const clouds1Y = useTransform(introScrollYProgress, [0, 1], ['0%', '20%']);
  const logoY = useTransform(introScrollYProgress, [0, 1], ['0%', '55%']);
  const logoTextY = useTransform(introScrollYProgress, [0, 0.8], ['0vh', '-65vh']);
  const logoTextScale = useTransform(introScrollYProgress, [0, 0.8, 0.9], [1, 1, 0.4]);
  
  const headerOpacity = useTransform(introScrollYProgress, [0.75, 0.9], [0, 1]);
  const headerY = useTransform(introScrollYProgress, [0.75, 0.9], ['-100%', '0%']);
  
  const fixedButtonsOpacity = useTransform(headerOpacity, (value) => {
    if (isNarrow) {
      return value <= 0.2 ? 1 : value >= 0.8 ? 0 : 1 - ((value - 0.2) / 0.6);
    }
    return 1;
  } );
  const fixedPlayButtonOpacity = useTransform(headerOpacity, [0, 0.3, 1], ['rgba(244, 216, 160, 0.7)', 'rgba(244, 216, 160, 0.7)', 'rgba(244, 216, 160, 1)']);
  const fixedMuteButtonOpacity = useTransform(headerOpacity, [0, 0.3, 1], ['rgba(244, 216, 160, 0.2)', 'rgba(244, 216, 160, 0.2)', 'rgba(244, 216, 160, 0)']);
  const fixedMuteButtonBorder = useTransform(headerOpacity, [0, 0.3, 1], ['0.1vmin solid rgba(244, 216, 160, 0.5)', '0.1vmin solid rgba(244, 216, 160, 0.5)', '0.1vmin solid rgba(244, 216, 160, 0.0)']);
  const fixedMuteButtonShadow = useTransform(headerOpacity, [0, 0.3, 1], ['0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.2)', '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.2)', '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.0)']);
  const fixedMuteButtonBackDrop = useTransform(headerOpacity, [0, 0.3, 1], ['blur(0.4vmin)', 'blur(0.4vmin)', 'blur(0vmin)']);

  const footerY = useTransform(scrollYProgress, [0.9, 1], ['150%', '0%']);
  
  const introTextY = useTransform(introScrollYProgress, [0, 0.6], ['90vh', '78vh']);
  const playButtonY = useTransform(introScrollYProgress, [0, 0.6], ['110vh', '104vh']);
  const clouds2Y = useTransform(introScrollYProgress, [0, 1], ['0%', '5%']);
  const clouds2Opacity = useTransform(introScrollYProgress, [0.4, 0.66], [1, 0]); //TODO maybe put to 0.9 so the clouds are a bit visible once scrolled down

  const clouds1 = useMemo(() => generateCloudComponents(
    isMobile ? 10 : 50,
    {min: 10, max: 30}, 
    {min: isMobile ? 200 : 300, max: isMobile ? 400 : 500},  
    {min: -10, max: 40}, 
    {min: 0, max: 12}, 
    {min: 0.75, max: 0.85}
  ), [isMobile]);
  
  const clouds2 = useMemo(() => generateCloudComponents(
    isMobile ? 5 : 35, 
    {min: 10, max: 30}, 
    {min: isMobile ? 300 : 500, max: isMobile ? 600 : 900}, 
    {min: 20, max: 70}, 
    {min: 10, max: 15}, 
    {min: 0.75, max: 0.85}
  ), [isMobile]);
  
  const clouds2Foreground = useMemo(() => generateCloudComponents(
    isMobile ? 3 : 6, 
    {min: 10, max: 30}, 
    {min: isMobile ? 300 : 400, max: isMobile ? 600 : 800}, 
    {min: 30, max: 70}, 
    {min: 995, max: 1000}, 
    {min: 0.4, max: 0.7}
  ), [isMobile]);

  // Calculate and track the scrollbar width on the left side of the window
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  
  useEffect(() => {
    if (!isIdle) return;

    let idleFrame = 1;
    const totalIdleFrames = 8;
    const fps = 8;
    
    const idleAnimationInterval = setInterval(() => {
      if (hasBroken) return;
      idleFrame = (idleFrame % totalIdleFrames) + 1;
      const frameNumber = ('000' + idleFrame.toString()).slice(-3);
      
      setMaleDuelistSrc(`/images/duelist/male/idle/frame_${frameNumber}.png`);
      setFemaleDuelistSrc(`/images/duelist/female/idle/frame_${frameNumber}.png`);
    }, 1000 / fps);
    
    return () => {
      clearInterval(idleAnimationInterval);
    };
  }, [isIdle]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (hasBroken) return;

    if (isIdle && latest >= walkStart) {
      setIsIdle(false);
      setMaleDuelistSrc('/images/duelist/male/twosteps/frame_001.png');
      setFemaleDuelistSrc('/images/duelist/female/twosteps/frame_001.png');
      return;
    }

    if (!isIdle && latest < walkStart) {
      setIsIdle(true);
      return;
    }

    if (!isIdle) {
      const regex = /frame_(\d+)\.png/;
      const match = maleDuelistSrc.match(regex);
      const lastFrame = match ? match[1] : "001";

    if (latest >= walkStart && latest < walkEnd) {
      const animationTime = ((walkEnd - walkStart) / 5)
      const currentFrame = Math.floor(((latest - walkStart) % animationTime) / (animationTime / 16)) + 1
        const frameNumber = ('000' + currentFrame.toString()).slice(-3)

        if (lastFrame != frameNumber && currentFrame % 2 == 0 && currentFrame <= 16) {
          setMaleDuelistSrc(`/images/duelist/male/twosteps/frame_${frameNumber}.png`)
          setFemaleDuelistSrc(`/images/duelist/female/twosteps/frame_${frameNumber}.png`)
        }
      }
    }
  })

  useMotionValueEvent(duelistShoot, "change", (latest) => {
    if (isIdle) return;
    
    const regex = /frame_(\d+)\.png/;
    
    const isShooting = maleDuelistSrc.includes('/shoot/');
    
    const match = maleDuelistSrc.match(regex);
    
    const lastFrame = parseInt(match ? match[1] : "001");

    const currentFrame = Math.floor(latest / (1 / 16)) + 1
    const frameNumber = ('000' + currentFrame.toString()).slice(-3)

    if (hasBroken && currentFrame <= lastFrame) return

    if (lastFrame != currentFrame && currentFrame <= 16) {
      if (hasBroken && lastFrame < 16 && isShooting) {
        const nextFrame = ('000' + (lastFrame + 1).toString()).slice(-3);
        setMaleDuelistSrc(`/images/duelist/male/shoot/frame_${nextFrame}.png`)
        setFemaleDuelistSrc(`/images/duelist/female/shoot/frame_${nextFrame}.png`)
      } else if (!hasBroken) {
        setMaleDuelistSrc(`/images/duelist/male/shoot/frame_${frameNumber}.png`)
        setFemaleDuelistSrc(`/images/duelist/female/shoot/frame_${frameNumber}.png`)
      }
    }

    if (currentFrame == 8 && breakButtonRef.current && !hasBroken && lastFrame < currentFrame && shotSoundRef.current && breakSoundRef.current) {
      setHasBroken(true);
      sessionStorage.setItem("hasBroken", "true")
      breakButtonRef.current.breakButton();
      shotSoundRef.current.play();
      breakSoundRef.current.play();
    }
  })

  useEffect(() => {
    const handleWheel = (event: any) => {
      event.preventDefault();

      if(!hasEntered) return;

      console.log('wheel', event);

      smoothScroll(event)
    };

    const handleTouch = (event: any) => {
      if (!hasEntered) event.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('touchmove', handleTouch, { passive: false });
    window.addEventListener('touchend', handleTouch, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('touchend', handleTouch);
    };
  }, [smoothScroll, hasEntered]);

  function playEnterAnimation() {
    if (!hasEntered) {
      lineOverlayControls.start({
        width: 0,
        transition: {
          duration: 0.7, ease: 'easeInOut'
        }
      })
      diamondOverlayControls.start({
        opacity: 0,
        transition: {
          duration: 0.4, ease: 'easeInOut', delay: 0.45
        }
      })
      overlayControls.start({
        opacity: 0,
        transition: {
          duration: 1.1, ease: 'easeInOut', delay: 0.5
        }
      })
      animate(
        ".ExitText",
        { opacity: 0, y: 100 },
        {
          duration: 0.5,
          delay: 0.2,
          // delay: stagger(0.2),
          ease: easeInOut
        }
      );
      animate(
        ".RadialGradient",
        { opacity: 0 },
        {
          duration: 0.4,
          delay: 0.4,
          ease: easeInOut
        }
      );

      smoothScrollToPercentage(walkStart, 1600, () => {
        setHasEntered(true);
        setDisablePointer(true);
        sessionStorage.setItem("disablePointer", "false")
        sessionStorage.setItem("hasEntered", "true")
      })
    }
    if (audioRef.current) {
      audioRef.current.play();
    }
  }

  useEffect(() => {
    textOverlayControls.start({
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
      }
    })

    return () => textOverlayControls?.stop();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (audioRef.current && shotSoundRef.current && breakSoundRef.current) {
        if (!isMuted) {
          audioRef.current.volume = 0.15;
          shotSoundRef.current.volume = 0.3;
          breakSoundRef.current.volume = 0.3;
        } else {
          audioRef.current.volume = 0;
          shotSoundRef.current.volume = 0;
          breakSoundRef.current.volume = 0;
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isMuted]);

  function toggleMute() {
    if (audioRef.current && shotSoundRef.current && breakSoundRef.current) {
      if (isMuted) {
        setIsMuted(false)
        localStorage.setItem("isMuted", "false")
      } else {
        setIsMuted(true)
        localStorage.setItem("isMuted", "true")
      }
    }
  }
  
  return (
    <App>
      <div style={{ backgroundColor: '#808080' }}>
        {!hasEntered && <m.div id="overlay" className={disablePointer ? 'NoTouch NoMouse' : 'YesTouch YesMouse'}>
          <m.div 
            animate={overlayControls}
            style={{
              position: 'fixed',
              top: 0, 
              left: 0, 
              width: '100%',
              height: '100%',
              backgroundColor: '#00000066',
              zIndex: 1,
            }}
          />
          <m.div 
            className='YesTouch YesMouse'
            style={{
              position: 'fixed',
              top: 0, 
              left: 0, 
              width: '100%',
              height: '100%',
              zIndex: 10,
            }}
            onClick={() => playEnterAnimation()}
            onTouchEnd={() => playEnterAnimation()}
          >
            <m.div 
              className="DisplayFlex FlexColumn Centered RadialGradient"
              style={{
                position: 'absolute',
                top: '87vh',
                width: '100%',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              }}
            >
              <m.div animate={textOverlayControls} className="CenteredContainer FlexRow TextWidth">
                <m.h3 className="ExitText TextLeft" style={{ userSelect: 'none' }}>PRESS</m.h3>
                <m.h3 className="ExitText TextCenter" style={{ userSelect: 'none' }}>TO</m.h3>
                <m.h3 className="ExitText TextRight" style={{ userSelect: 'none' }}>ENTER</m.h3>
              </m.div>
              <div className="line-container">
                <m.div animate={lineOverlayControls} className="horizontal-line"></m.div>
                <m.div animate={diamondOverlayControls} className="diamond">
                  <div className="diamond-inner"></div>
                </m.div>
              </div>
            </m.div>
          </m.div>
        </m.div>}
        <m.div className="PageBackground" style={{ y: backgroundTransformY }}>
          <div style={{ width: '100vw', height: backgroundHeight, overflow: 'hidden', position: 'relative', backgroundColor: '#0347AD' }}>
            <img 
              src='/images/bg_extension_2.png' 
              style={{ 
                width: '100vw', 
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'bottom',
                position: 'absolute',
                bottom: 0
              }} 
            />
          </div>
          <Img ref={backgroundImageRef} src='/images/bg_duel_scene.png' style={{ height: '100%', width: '100vw', zIndex: -1, y: -2 }} />
          <div 
            style={{ 
              transform: 'translate(-50%, 0%)',
              position: 'absolute', 
              bottom: duelistShift,
              left: '54%', 
            }}
          >
            <m.img 
              ref={duelistRef}
              src={femaleDuelistSrc}
              initial={{ x: 0 }}
              style={{ 
                willChange : 'contents',
                x: hasBroken ? '38vw' : duelistWalk,
                height: '14vw', 
                width: 'auto',
                maxHeight: '60vh',
                minHeight: '15vh',
                zIndex: 0
              }} 
            />
          </div>
          <div 
            style={{ 
              transform: `translate(-50%, 0%) scaleX(${isMaleIdle ? '1' : '-1'})`,
              position: 'absolute', 
              bottom: duelistShift,
              left: '46%', 
            }}
          >
            <m.img 
              src={maleDuelistSrc}
              initial={{ x: 0 }}
              style={{ 
                willChange : 'contents',
                x: hasBroken ? '38vw' : duelistWalk,
                height: '14vw', 
                width: 'auto',
                maxHeight: '60vh',
                minHeight: '15vh',
                zIndex: 0 
              }} 
            />
          </div>
        </m.div>
        <div id="intro" ref={introBlockRef} style={{ position: 'absolute', width: '100%', height: '225vh', top: '0' }}>
          <m.div className="HeaderLayer" style={{ y: clouds1Y, zIndex: 1, overflowX: 'clip' }}>
            {clouds1}
          </m.div>
          <m.div className="HeaderLayer" style={{ y: logoY, zIndex: 20 }} 
            // whileHover={{ scale: 1.1 }}
          >
            <Img
              src='/images/logo.svg' 
              style={{ 
                position: 'absolute', 
                top: '30vh', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                height: '35vh', 
                width: 'auto',
                maxHeight: '50vw',
                zIndex: 12,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }} 
              // onClick={() => window.location.href='https://prerelease.pistols.gg/'}
              // onMouseEnter={() => setTooltipText("Click to Play Pistols at Dawn")}
              // onMouseLeave={() => setTooltipText(null)}
            />
          </m.div>

          {/* Header Fixed Buttons */}
          <m.div style={{ 
            position: 'fixed', 
            top: 0, 
            right: 0, 
            margin: isNarrow ? '4vh 2vh' : '4vh 4vh', 
            zIndex: 999, 
            display: 'flex',
            alignItems: 'center',
            gap: '1.6vmin',
          }}>
            <m.a 
              href="https://pistols.lootunder.world/" 
              style={{ 
                opacity: fixedButtonsOpacity,
                color: '#000', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                backgroundColor: fixedPlayButtonOpacity,
                padding: '0.7vh 1.5vh',
                borderRadius: '0.4vmin',
                fontSize: 'min(1.8vh, 4.4vmin)',
                cursor: 'pointer',
                backdropFilter: 'blur(0.4vmin)',
                border: '0.1vmin solid rgba(244, 216, 160, 0.8)',
                boxShadow: '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.2)',
              }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 216, 160, 0.9)' }}
              onMouseEnter={() => setTooltipText("Play Pistols at Dawn")}
              onMouseLeave={() => setTooltipText(null)}
            >Play Game</m.a>
            
            <m.a 
              href="/docs" 
              style={{ 
                opacity: fixedButtonsOpacity,
                color: '#F4D8A0', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                backgroundColor: fixedMuteButtonOpacity,
                padding: '0.7vh 1.5vh',
                borderRadius: '0.4vmin',
                fontSize: 'min(1.8vh, 4.4vmin)',
                cursor: 'pointer',
                backdropFilter: fixedMuteButtonBackDrop,
                border: fixedMuteButtonBorder,
                boxShadow: fixedMuteButtonShadow,
              }}
              whileHover={{ scale: 1.1 }}
              onMouseEnter={() => setTooltipText("Visit to learn more!")}
              onMouseLeave={() => setTooltipText(null)}
            >Docs</m.a>
            
            <m.div 
              style={{ 
                width: '3.6vh', 
                height: '3.6vh', 
                padding: '0.6vh', 
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: fixedMuteButtonOpacity,
                backdropFilter: fixedMuteButtonBackDrop,
                border: fixedMuteButtonBorder,
                boxShadow: fixedMuteButtonShadow,
              }}
              whileHover={{ scale: 1.2 }}
              onClick={() => toggleMute()}
              onMouseEnter={() => setTooltipText(isMuted ? "Unmute" : "Mute")}
              onMouseLeave={() => setTooltipText(null)}
            >
              <img 
                style={{ 
                  width: 'auto', 
                  height: '100%',
                  filter: 'brightness(0) saturate(100%) invert(83%) sepia(19%) saturate(620%) hue-rotate(348deg) brightness(101%) contrast(92%)'
                }} 
                src={isMuted ? '/images/icon/icon_volume-off.svg' : '/images/icon/icon_volume-on.svg'} 
                alt={isMuted ? 'Unmute' : 'Mute'}
              />
            </m.div>
          </m.div>
          {/* Header */}
          <m.div className="HeaderLayer TopHeader tilt-right" style={{ y: headerY, opacity: headerOpacity }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <m.img 
                src='/images/logo.svg' 
              style={{ 
                  height: 'min(12vh, 20vmin)', 
                  marginTop: '1rem', 
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  touchAction: 'auto'
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => window.location.href='https://prerelease.pistols.gg/'}
                onMouseEnter={() => setTooltipText("Click to Play Pistols at Dawn")}
                onMouseLeave={() => setTooltipText(null)}
              />
            </div>
          </m.div>

          <m.a className="HeaderLayer"
            href="https://pistols.lootunder.world/"
            style={{ 
              zIndex: 991, 
              position: 'fixed', 
              y: logoTextY,
              top: '65vh',
              margin: 'auto',
              left: `calc(0px + ${scrollbarWidth / 2}px)`,
              right: `calc(0px - ${scrollbarWidth / 2}px)`,
              height: '12vh', 
              width: '70vh', 
              maxHeight: '40vh',
              maxWidth: '80vmin',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              pointerEvents: disablePointer ? 'none' : 'auto',
              touchAction: disablePointer ? 'none' : 'auto',
            }}
            whileHover={{ scale: 1.1 }}
            onMouseEnter={() => setTooltipText("Click to Play")}
            onMouseLeave={() => setTooltipText(null)}
          >
            <m.img 
              src='/images/logo_text.svg' 
              style={{ 
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                scale: logoTextScale,
                pointerEvents: disablePointer ? 'none' : 'auto',
                touchAction: disablePointer ? 'none' : 'auto',
              }}
              alt="Dojo Logo"
            />
          </m.a>
          
          <m.div className="HeaderLayer DisplayFlex Centered" style={{ zIndex: 1, top: introTextY }}>
            <div style={{ 
              height: 'auto', 
              width: '70vmax', 
              maxHeight: '44vh',
              maxWidth: '44vmax',
              objectFit: 'contain',
              padding: '2vmin',
              textAlign: 'center', 
              margin: '0 auto',
              borderRadius: '1vmin',
              background: 'linear-gradient(rgba(11, 105, 217, 0.15), rgba(0, 73, 185, 0.25))',
              backdropFilter: 'blur(0.4vmin)',
              border: '0.1vmin solid rgba(244, 216, 160, 0.5)',
              boxShadow: '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.1)',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              marginBottom: '1vmin',
              textShadow: '0 0.2vmin 0.4vmin rgba(0,0,0,0.4)',
              color: '#F4D8A0',
              fontSize: 'min(1.8vh, 4.4vmin)',
              lineHeight: '1.6',
            }}>
              Kill or be killed — not just a game, but a showdown of souls.
              <br />
              Challenge a friend or a foe in an atmospheric, onchain duel where every choice, bluff, and bullet is forever etched in the blockchain.
              <br />
              Pick your cards. Choose your moment. Fire… or don't.
              <br />
              Each duel tells a story — make yours legendary.
            </div>
          </m.div>
          
          <m.div className="HeaderLayer DisplayFlex Centered" style={{ zIndex: 2, scale: buttonScale, top: playButtonY }}>
            <BreakingButton title="Play Game" onClick={() => window.location.href='https://pistols.lootunder.world/'} style={{  }}/>
          </m.div>
          <m.div className="HeaderLayer" style={{ y: clouds2Y, zIndex: 1, opacity: clouds2Opacity, overflowX: 'clip' }}>
            {clouds2}
          </m.div>
          <m.div className="HeaderLayer" style={{ y: clouds2Y, zIndex: 995, opacity: clouds2Opacity, overflowX: 'clip' }}>
            {clouds2Foreground}
          </m.div>
        </div>
        <div className="YesMouse YesTouch" style={{ position: 'relative', width: '100%', zIndex: 5, top: '200vh' }}>
          <div className="SpacerBottomTransparent"/>
          {/* About */}
          <ParagraphWrapper 
            id="About" 
            backgroundTilt="right"
            decorations={
              <>
                <div className="rose top-left-corner" />
                <div className="top-edge" />
                <div className="left-edge" />
                <div className="leaf bottom-right-corner" />
                <div className="leaf-ext bottom-right-corner-ext" />
              </>
            }
          >
            <h2 style={{ fontWeight: 'bold', fontSize: 'min(5.6vh, 7.4vmin)', marginBottom: '2rem', textAlign: 'center', width: isNarrow ? '100%' : '50%', marginLeft: '0' }}>ABOUT</h2>
            <div className="ui stackable two column grid" style={{ marginTop: '2rem' }}>
              <div className={`column ${isNarrow ? 'sixteen wide' : 'eight wide'}`} style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: 'min(3.2vh, 6vmin)', color: '#F4D8A0', marginBottom: '1.5rem' }}>THE WORLD OF HONOR</h3>
                <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.6', marginBottom: '2rem' }}>
                  Pistols at Dawn is an on-chain dueling game where honor, strategy, and nerve determine your fate. Set in a richly crafted world inspired by the age of dueling, this game combines traditional gameplay mechanics with web3 technology.
                </p>
                
                <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.6', marginBottom: '2rem' }}>
                  Every duel is recorded on the blockchain, creating a permanent record of your character's journey through a world where reputation is everything and honor must be defended at all costs.
                </p>
                
                <div style={{ width: isNarrow ? '90%' : '60%', margin: '0 auto', marginBottom: '4rem' }}>
                  <h4 style={{ fontSize: 'min(2.6vh, 5vmin)', color: '#F4D8A0', marginBottom: '0.8rem' }}>CORE PRINCIPLES</h4>
                  <ul style={{ paddingLeft: '1.5rem', fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.6' }}>
                    <li style={{ marginBottom: '0.8rem' }}>Strategic gameplay with meaningful choices</li>
                    <li style={{ marginBottom: '0.8rem' }}>True ownership of in-game assets</li>
                    <li style={{ marginBottom: '0.8rem' }}>Community-driven development and governance</li>
                    <li style={{ marginBottom: '0.8rem' }}>Immersive storytelling and world-building</li>
                  </ul>
                </div>

                <h4 style={{ fontSize: 'min(2.6vh, 5vmin)', color: '#F4D8A0', marginBottom: '2rem', textAlign: 'center' }}>OUR PHILOSOPHY</h4>
                <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', textAlign: 'center', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Pistols at Dawn represents a fusion of classic gaming principles with blockchain innovation. We're building a world where your skills, decisions, and reputation create a lasting legacy on the chain.
                </p>
                <div className="ui divider" style={{ borderTop: '1px solid rgba(138, 110, 75, 0.5)', margin: '1.5rem 0' }}></div>
                <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', textAlign: 'center', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Our mission is to create an immersive dueling experience where strategy trumps chance, and where every player can carve their own path to infamy or glory.
                </p>
                <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', textAlign: 'center', lineHeight: '1.6' }}>
                  <strong>Coming Soon</strong>: New Duelist Mechanics, Duelist Ranks, tournaments, card collections and prestigious rewards.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                  <m.a 
                    href="https://pistols.lootunder.world/" 
                    style={{ 
                      color: '#000', 
                      textDecoration: 'none', 
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(244, 216, 160, 1)',
                      padding: '0.7vh 1.5vh',
                      borderRadius: '0.4vmin',
                      fontSize: 'min(1.8vh, 4.4vmin)',
                      cursor: 'pointer',
                      backdropFilter: 'blur(0.4vmin)',
                      border: '0.1vmin solid rgba(244, 216, 160, 0.8)',
                      boxShadow: '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.2)',
                    }}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 216, 160, 0.9)' }}
                    onMouseEnter={() => setTooltipText("Play Pistols at Dawn")}
                    onMouseLeave={() => setTooltipText(null)}
                  >
                    Start Your Journey
                  </m.a>
                </div>
              </div>
              
              <div className={`column ${isNarrow ? 'hidden' : 'eight wide'}`}>
                {!isNarrow && <div style={{ 
                  width: '100%', 
                  backgroundColor: '#112233',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '3px solid #8a6e4b',
                  boxShadow: '0 0.4vmin 1.2vmin rgba(0, 0, 0, 0.5)',
                  marginBottom: '2rem',
                  height: 'calc(100% - 2rem)'
                }}>
                  {/* TODO: Add comic strip? */}
                </div>}
              </div>
            </div>
          </ParagraphWrapper>

          {/* Socials */}
          <div className="SpacerTopBottomTransparent"/>

          <ParagraphWrapper 
            id="Socials" 
            backgroundTilt="left"
            decorations={
              <>
                <div className="leaf top-left-corner" />
                <div className="leaf-ext top-left-corner-ext" />
                <div className="rose top-right-corner" />
                <div className="rose-ext top-right-corner-ext" />
                <div className="rose bottom-left-corner" />
                <div className="rose-ext bottom-left-corner-ext" />
                <div className="leaf bottom-right-corner" />
                <div className="leaf-ext bottom-right-corner-ext" />
              </>
            }
          >
            <h2 style={{ fontWeight: 'bold', fontSize: 'min(5.6vh, 7.4vmin)', marginBottom: '2rem' }}>The World Beyond the Tavern</h2>
            <p style={{ textAlign: 'center', marginBottom: '3rem', fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.6' }}>
              The Fool & Flintlock is just the doorway. But the real legends? They live in the shadows — in whispers, wagers, and war stories.
            </p>
            
            <div className="ui three column stackable grid" style={{ marginTop: '2rem', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
              <div className="column" style={{ paddingRight: '2rem', paddingLeft: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div 
                  className="social-card"
                  onMouseEnter={() => setTooltipText("The barkeep's blueprints. Code, scrolls, and schematics from the boldest patrons.<br />If you're building, fixing, or breaking… start here.")}
                  onMouseLeave={() => setTooltipText(null)}
                >
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#112233' }}>
                    <img src="/images/socials_github.png" alt="GitHub" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ 
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: '0.8rem', 
                    backgroundColor: 'rgba(221, 194, 139, 0.9)', 
                    textAlign: 'center',
                    color: '#112233',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: 'min(1.8vh, 4.4vmin)' }}>The Workbench <br />(GitHub)</div>
                  </div>
                </div>
              </div>
              
              <div className="column" style={{ paddingRight: '2rem', paddingLeft: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div 
                  className="social-card"
                  onMouseEnter={() => setTooltipText("Where patrons whisper, wager, and weave conspiracies.<br />If you want answers—or allies—this is where you knock.")}
                  onMouseLeave={() => setTooltipText(null)}
                >
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#112233' }}>
                    <img src="/images/socials_discord.png" alt="Discord" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ 
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: '0.8rem', 
                    backgroundColor: 'rgba(221, 194, 139, 0.9)', 
                    textAlign: 'center',
                    color: '#112233',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: 'min(1.8vh, 4.4vmin)' }}>The Back Room <br />(Discord)</div>
                  </div>
                </div>
              </div>
              
              <div className="column" style={{ paddingRight: '2rem', paddingLeft: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div 
                  className="social-card" 
                  onMouseEnter={() => setTooltipText("Duels, drama, and death threats—pinned for all to see.<br />If it's loud, it ends up here.")}
                  onMouseLeave={() => setTooltipText(null)}
                >
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#112233' }}>
                    <img src="/images/socials_x.png" alt="X" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ 
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: '0.8rem', 
                    backgroundColor: 'rgba(221, 194, 139, 0.9)', 
                    textAlign: 'center',
                    color: '#112233',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: 'min(1.8vh, 4.4vmin)' }}>The Noticeboard <br />(X)</div>
                  </div>
                </div>
              </div>
            </div>
          </ParagraphWrapper>
            
          <div className="SpacerTopBottomTransparent"/>

          {/* Gameplay */}
          <ParagraphWrapper 
            id="Gameplay" 
            backgroundTilt="right"
            decorations={
              <>
                <div className="rose top-right-corner" />
                <div className="top-edge flip" />

                <div className="leaf bottom-left-corner" />
                <div className="bottom-edge leaf" />

              </>
            }
          >
            <h2 style={{ fontWeight: 'bold', fontSize: 'min(5.6vh, 7.4vmin)', marginBottom: '2rem', textAlign: 'center', width: isNarrow ? '100%' : '50%', marginLeft: 'auto', marginRight: '0' }}>GAMEPLAY MECHANICS</h2>
            <div className="ui stackable two column grid" style={{ marginTop: '2rem' }}>
              <div className="column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  width: '100%', 
                  height: 'auto',
                  aspectRatio: '16/9',
                  margin: 'auto 0',
                  backgroundColor: '#112233',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '3px solid #8a6e4b',
                  boxShadow: '0 0.4vmin 1.2vmin rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Video or visualization space */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.6' }}>
                      Video demonstration coming soon
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="column" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ 
                    fontSize: 'min(3.2vh, 6vmin)', 
                    color: '#F4D8A0', 
                    marginBottom: '1rem', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    10 Steps. 2 Bullets. Don't Flinch.
                  </h3>
                  
                  <p style={{ 
                    fontSize: 'min(1.8vh, 4.4vmin)', 
                    color: '#F4D8A0', 
                    lineHeight: '1.6', 
                    marginBottom: '1.5rem', 
                    fontStyle: 'italic',
                    maxWidth: '90%',
                    margin: '0 auto 1.5rem',
                    textAlign: 'center'
                  }}>
                    Every duel is a deadly dance of wits and timing—where your life hangs by a thread.
                  </p>

                  <div className="ui divider" style={{ 
                    borderTop: '1px solid rgba(138, 110, 75, 0.5)', 
                    margin: '1.5rem auto', 
                    width: '90%' 
                  }}></div>
                  
                  <div style={{ 
                    width: '90%', 
                    margin: '0 auto 1.5rem', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <p style={{ 
                      fontSize: 'min(1.8vh, 4.4vmin)', 
                      color: '#F4D8A0', 
                      marginBottom: '1rem', 
                      fontWeight: 'bold' 
                    }}>
                      Four secret choices shape your fate:
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '1rem',
                      width: '100%',
                      maxWidth: '550px',
                      margin: '0 auto 1rem'
                    }}>
                      <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <p style={{ 
                          fontSize: 'min(1.8vh, 4.4vmin)', 
                          color: '#F4D8A0', 
                          fontWeight: 'bold',
                          marginBottom: '0.3rem'
                        }}>Your Shot</p>
                        <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0' }}>Pick one step (1-10) to fire</p>
                      </div>
                      
                      <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <p style={{ 
                          fontSize: 'min(1.8vh, 4.4vmin)', 
                          color: '#F4D8A0', 
                          fontWeight: 'bold',
                          marginBottom: '0.3rem'
                        }}>Your Dodge</p>
                        <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0' }}>Pick when to evade (1-10)</p>
                      </div>
                      
                      <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <p style={{ 
                          fontSize: 'min(1.8vh, 4.4vmin)', 
                          color: '#F4D8A0', 
                          fontWeight: 'bold',
                          marginBottom: '0.3rem'
                        }}>Your Tactic</p>
                        <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0' }}>Buff yourself or hinder foe</p>
                      </div>
                      
                      <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <p style={{ 
                          fontSize: 'min(1.8vh, 4.4vmin)', 
                          color: '#F4D8A0', 
                          fontWeight: 'bold',
                          marginBottom: '0.3rem'
                        }}>Your Blade</p>
                        <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0' }}>Last resort if both survive</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ui divider" style={{ 
                    borderTop: '1px solid rgba(138, 110, 75, 0.5)', 
                    margin: '1.5rem auto 1.5rem', 
                    width: '90%' 
                  }}></div>
                  
                  <h4 style={{ 
                    fontSize: 'min(2.6vh, 5vmin)', 
                    color: '#F4D8A0', 
                    marginBottom: '1rem',
                    textTransform: 'uppercase'
                  }}>The Deadliest Game of Timing</h4>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    maxWidth: '550px',
                    margin: '0 auto 1.5rem'
                  }}>
                    <div style={{ 
                      width: '48%', 
                      padding: '1rem', 
                      border: '1px solid rgba(138, 110, 75, 0.5)',
                      borderRadius: '4px'
                    }}>
                      <p style={{ 
                        fontSize: 'min(1.8vh, 4.4vmin)', 
                        color: '#F4D8A0', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                      }}>Shoot Early</p>
                      <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.5', textAlign: 'left' }}>
                        Quick but reckless. Your hands are unsteady, your aim wild. You may live longer... but at what cost to your honor?
                      </p>
                    </div>
                    
                    <div style={{ 
                      width: '48%', 
                      padding: '1rem', 
                      border: '1px solid rgba(138, 110, 75, 0.5)',
                      borderRadius: '4px'
                    }}>
                      <p style={{ 
                        fontSize: 'min(1.8vh, 4.4vmin)', 
                        color: '#F4D8A0', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                      }}>Shoot Late</p>
                      <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.5', textAlign: 'left' }}>
                        Ice-cold precision. Your aim finds vital organs... if you live long enough to pull the trigger.
                      </p>
                    </div>
                  </div>
                  
                  <div className="ui divider" style={{ 
                    borderTop: '1px solid rgba(138, 110, 75, 0.5)', 
                    margin: '1.5rem auto', 
                    width: '90%' 
                  }}></div>
                  
                  <h3 style={{ 
                    fontSize: 'min(3.2vh, 6vmin)', 
                    color: '#F4D8A0', 
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase'
                  }}>Blades Round</h3>
                  
                  <p style={{ 
                    fontSize: 'min(1.8vh, 4.4vmin)', 
                    color: '#F4D8A0', 
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                    maxWidth: '80%',
                    margin: '0 auto 1rem',
                    textAlign: 'center'
                  }}>
                    Both survived the bullets? Time to draw steel.
                  </p>
                  
                  <p style={{ 
                    fontSize: 'min(1.8vh, 4.4vmin)', 
                    color: '#F4D8A0', 
                    fontStyle: 'italic',
                    lineHeight: '1.8',
                    maxWidth: '70%',
                    margin: '0 auto 1.5rem',
                    textAlign: 'center'
                  }}>
                    No more guessing games.<br />
                    No second chances.<br />
                    Only death—or seppuku.
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <m.a 
                      href="https://pistols.lootunder.world/" 
                      style={{ 
                        color: '#000', 
                        textDecoration: 'none', 
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(244, 216, 160, 1)',
                        padding: '0.7vh 1.5vh',
                        borderRadius: '0.4vmin',
                        fontSize: 'min(1.8vh, 4.4vmin)',
                        cursor: 'pointer',
                        backdropFilter: 'blur(0.4vmin)',
                        border: '0.1vmin solid rgba(244, 216, 160, 0.8)',
                        boxShadow: '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.2)',
                      }}
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 216, 160, 0.9)' }}
                      onMouseEnter={() => setTooltipText("Play Pistols at Dawn")}
                      onMouseLeave={() => setTooltipText(null)}
                    >
                      Face Your Opponent
                    </m.a>
                  </div>
                </div>
              </div>
            </div>
          </ParagraphWrapper>
          
          <div className="SpacerTopBottomTransparent"/>

          {/* Duelists */}
          <ParagraphWrapper 
            id="About" 
            backgroundTilt="right"
            decorations={
              <>
                <div className="rose top-left-corner" />
                <div className="rose-ext top-left-corner-ext" />
                <div className="rose bottom-left-corner" />
                <div className="rose-ext bottom-left-corner-ext" />
                <div className="leaf top-right-corner" />
                <div className="right-edge leaf" />
              </>
            }
          >
            <h2 style={{ fontWeight: 'bold', fontSize: 'min(5.6vh, 7.4vmin)', marginBottom: '2rem', textAlign: 'center', width: isNarrow ? '100%' : '50%', marginLeft: '0' }}>THE DUELISTS</h2>
            <div className={`ui ${isNarrow ? 'stackable one' : 'stackable two'} column grid`} style={{ marginTop: '2rem' }}>
              <div className="column">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  {/* <h3 style={{ fontSize: '2.2rem', color: '#F4D8A0', marginBottom: '1.5rem', textAlign: 'center' }}>CHARACTERS OF HONOR</h3> */}
                  <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '800px', margin: '0 auto 1.5rem', textAlign: 'center' }}>
                    The world of Pistols draws a clear distinction between Players and Duelists. Players are identified by their wallet address, while Duelists are unique NFTs with their own traits and abilities.
                  </p>
                  
                  <div style={{ marginBottom: '2rem', width: '80%', margin: '0 auto' }}>
                    <h4 style={{ fontSize: 'min(2.6vh, 5vmin)', color: '#F4D8A0', marginBottom: '1rem', textAlign: 'center' }}>DUELIST OWNERSHIP</h4>
                    <ul style={{ 
                      display: 'inline-block', 
                      textAlign: 'left', 
                      maxWidth: '600px',
                      margin: '0 auto',
                      paddingLeft: '1.5rem', 
                      fontSize: 'min(1.8vh, 4.4vmin)', 
                      color: '#F4D8A0', 
                      lineHeight: '1.6'
                    }}>
                      <li style={{ marginBottom: '0.8rem' }}>Duelists are ERC-721 tokens on the Starknet blockchain</li>
                      <li style={{ marginBottom: '0.8rem' }}>Every player receives two free Duelists to start their journey</li>
                      <li style={{ marginBottom: '0.8rem' }}>Each Duelist can only participate in one duel at a time</li>
                      <li style={{ marginBottom: '0.8rem' }}>Additional Duelists can be acquired using LORDS tokens</li>
                    </ul>
                  </div>
                </div>
                
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <h4 style={{ fontSize: 'min(2.6vh, 5vmin)', color: '#F4D8A0', marginBottom: '1rem', textAlign: 'center' }}>DUELIST TRAITS</h4>
                  <p style={{ fontSize: 'min(1.8vh, 4.4vmin)', color: '#F4D8A0', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '800px', margin: '0 auto 1.5rem', textAlign: 'center' }}>
                    Each Duelist comes with distinct traits, appearance, and backstory that affect their performance in duels. As your Duelist survives encounters, they gain experience and reputation.
                  </p>
                  
                  <ul style={{ 
                    display: 'inline-block', 
                    textAlign: 'left', 
                    maxWidth: '550px',
                    margin: '0 auto',
                    paddingLeft: '1.5rem', 
                    fontSize: 'min(1.8vh, 4.4vmin)', 
                    color: '#F4D8A0', 
                    lineHeight: '1.6'
                  }}>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Reputation</strong> - Your history affects how others perceive you</li>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Combat Records</strong> - Every victory and defeat is permanently recorded on-chain</li>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Duelist Stats</strong> - Each Duelist has unique attributes affecting their performance</li>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Experience</strong> - Battle-hardened duelists gain advantages over time</li>
                  </ul>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    {/* <m.a 
                      href="https://characters.lootunder.world/" 
                      style={{ 
                        color: '#000', 
                        textDecoration: 'none', 
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(244, 216, 160, 1)',
                        padding: '0.7vh 1.5vh',
                        borderRadius: '0.4vmin',
                        fontSize: '2.2vh',
                        margin: '0 1rem',
                        cursor: 'pointer',
                        backdropFilter: 'blur(0.4vmin)',
                        border: '0.1vmin solid rgba(244, 216, 160, 0.8)',
                        boxShadow: '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.2)',
                      }}
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 216, 160, 0.9)' }}
                      onMouseEnter={() => setTooltipText("Browse Characters")}
                      onMouseLeave={() => setTooltipText(null)}
                    >
                      Browse Characters
                    </m.a> */}
                    
                    <m.a 
                      href="https://pistols.lootunder.world/" 
                      style={{ 
                        color: '#000', 
                        textDecoration: 'none', 
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(244, 216, 160, 1)',
                        padding: '0.7vh 1.5vh',
                        borderRadius: '0.4vmin',
                        fontSize: 'min(1.8vh, 4.4vmin)',
                        cursor: 'pointer',
                        backdropFilter: 'blur(0.4vmin)',
                        border: '0.1vmin solid rgba(244, 216, 160, 0.8)',
                        boxShadow: '0 0.2vmin 0.8vmin rgba(0, 0, 0, 0.2)',
                      }}
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 216, 160, 0.9)' }}
                      onMouseEnter={() => setTooltipText("Play Pistols at Dawn")}
                      onMouseLeave={() => setTooltipText(null)}
                    >
                      Try your luck
                    </m.a>
                  </div>
                </div>
              </div>
              
              <div className="column">
                <div style={{ 
                  width: '100%', 
                  height: '55vh',
                  backgroundColor: '#112233',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '3px solid #8a6e4b',
                  boxShadow: '0 0.4vmin 1.2vmin rgba(0, 0, 0, 0.5)',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <SelectDuelistModal />
                  {/* <h4 style={{ fontSize: '1.6rem', color: '#F4D8A0', marginBottom: '1rem', textAlign: 'center' }}>THE CHALLENGE SYSTEM</h4>
                  <p style={{ fontSize: '1.2rem', color: '#F4D8A0', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Duels begin with a formal challenge sent from one player to another. Each challenge is an NFT recorded on the blockchain.
                  </p>
                  
                  <div className="ui divider" style={{ borderTop: '1px solid rgba(138, 110, 75, 0.5)', margin: '1.5rem 0' }}></div>
                  
                  <h5 style={{ fontSize: '1.4rem', color: '#F4D8A0', marginBottom: '0.8rem' }}>DUEL PROGRESSION</h5>
                  <ol style={{ 
                    display: 'inline-block', 
                    textAlign: 'left', 
                    paddingLeft: '1.5rem', 
                    fontSize: '1.2rem', 
                    color: '#F4D8A0', 
                    lineHeight: '1.6'
                  }}>
                    <li style={{ marginBottom: '0.5rem' }}>Challenge is created by the Challenger</li>
                    <li style={{ marginBottom: '0.5rem' }}>Challenged player accepts or refuses</li>
                    <li style={{ marginBottom: '0.5rem' }}>Both players secretly commit their moves</li>
                    <li style={{ marginBottom: '0.5rem' }}>Both players reveal their moves</li>
                    <li style={{ marginBottom: '0.5rem' }}>Game contract determines the outcome</li>
                    <li style={{ marginBottom: '0.5rem' }}>Winner claims victory and reputation</li>
                  </ol> */}
                </div>
              </div>
            </div>
          </ParagraphWrapper>

          <div className="SpacerTopTransparent"/>

          <div style={{ height: '50vh',  minHeight: 600, width: '100%' }}/>
          <div className="Paragraph DisplayFlex" style={{ flexDirection: 'column-reverse' }}>
            <m.div ref={breakButtonContainerRef} className="DisplayFlex Centered" style={{ position: 'fixed', y: buttonExit, top: buttonEnter, left: 0, right: 0, scale: buttonScale }}>
              <BreakingButton title="Play Game" ref={breakButtonRef} onClick={() => window.location.href='https://pistols.lootunder.world/'} style={{  }}/>
                  </m.div>
          </div>
        </div>
        <m.div className="BottomFooter tilt-right" style={{ y: footerY }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'nowrap', overflowX: 'auto' }}>
            {/* Left: Logo + Links */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <m.div style={{ height: '12vh', marginLeft: '1rem', marginBottom: '1rem' }} whileHover={{ scale: 1.1 }}>
                <a 
                  href="https://underware.gg/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onMouseEnter={() => setTooltipText("Learn more about us")}
                  onMouseLeave={() => setTooltipText(null)}
                >
                  <img src="/images/Underware.svg" alt="Underware Logo" style={{ height: '12vh', width: '10vw', minWidth: '6vh', objectFit: 'contain' }} />
                </a>
              </m.div>

              <div style={{ marginLeft: '6rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {[
                  { href: 'https://discord.gg/underware', label: 'Underware Discord', tooltip: 'Join our Discord community' },
                  { href: 'https://x.com/underware', label: 'Underware X', tooltip: 'Follow us on X' },
                  { href: 'https://github.com/underware', label: 'Underware GitHub', tooltip: 'Check our GitHub' }
                ].map(({ href, label, tooltip }) => (
                  <m.div key={label} style={{ display: 'flex', alignItems: 'center' }} whileHover={{ scale: 1.1 }}>
                    <span style={{ marginRight: '0.8rem', fontSize: '1.4rem' }}>•</span>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-text"
                      onMouseEnter={() => setTooltipText(tooltip)}
                      onMouseLeave={() => setTooltipText(null)}
                      style={{ fontSize: 'min(1.8vh, 4.4vmin)' }}
                    >{label}</a>
                  </m.div>
                ))}
              </div>
            </div>

            {/* Right: Partner Logos */}
            <div className="footer-icon-grid">
              {[
                { src: '/images/RealmsWorld.svg', alt: 'RealmsWorld', href: 'https://x.com/lootrealms?lang=en', tooltip: 'Explore the Realms World Discord' },
                { src: '/images/starknet.png', alt: 'Starknet', href: 'https://starknet.io/', tooltip: 'Learn more about Starknet' },
                { src: '/images/dojo.svg', alt: 'Dojo', href: 'https://www.dojoengine.org/', tooltip: 'Learn more about Dojo' },
                { src: '/images/cartridge.svg', alt: 'Cartridge', href: 'https://docs.cartridge.gg/', tooltip: 'Learn more about Cartridge' }
              ].map(({ src, alt, href, tooltip }) => (
                <m.div key={alt} whileHover={{ scale: 1.1 }} className="logo-wrapper">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setTooltipText(tooltip)}
                    onMouseLeave={() => setTooltipText(null)}
                  >
                    <div className="logo-inner">
                      <img src={src} alt={alt} className="partner-logo" />
                    </div>
                  </a>
                </m.div>
              ))}
            </div>
          </div>
        </m.div>


        <div>
          {!isMobile && (
            <MouseToolTip text={tooltipText} />
          )}
          
          <audio ref={audioRef} loop autoPlay>
            <source src="/audio/biodecay-song6.mp3" type="audio/mp3" />
          </audio>
          <audio ref={shotSoundRef} src="/audio/sfx/pistol-shot.mp3" />
          <audio ref={breakSoundRef} src="/audio/sfx/pistol-shot.mp3"/>
        </div>
      </div>
    </App>
  )
}