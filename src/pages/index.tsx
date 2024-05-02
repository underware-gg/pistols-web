import App from "@/components/App";
import { BreakingButton } from "@/components/breakingbutton/BreakingButton";
import generateCloudComponents from "@/components/Cloud";
import { InfiniteHorizontalScroll, ScrollDirection } from "@/components/InfiniteHorizontalScroll";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { smoothScrollToPercentage } from "@/utils/smoothScroll";
import { Box, boxClasses, Grid } from "@mui/material";
import { animate,  easeIn,  easeInOut, easeOut, motion as m, stagger, useAnimation, useAnimationControls, useMotionValueEvent, useScroll, useTransform, Variants } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image as Img } from "semantic-ui-react";

export default function Home() {
  const smoothScroll = useSmoothScroll();
  const { width: displayWidth, height: displayHeight } = useWindowDimensions();

  const backgroundImageRef = useRef<any>(null);
  const aboutBlockRef = useRef<any>(null);
  const duelistRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shotSoundRef = useRef<HTMLAudioElement>(null);
  const breakSoundRef = useRef<HTMLAudioElement>(null);
  const breakButtonRef = useRef<any>(null);
  const breakButtonContainerRef = useRef<any>(null);

  const [duelistSrc, setDuelistSrc] = useState('/images/duelist/twosteps/frame_01.png');
  const [hasEntered, setHasEntered] = useState(false);
  const [disablePointer, setDisablePointer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasBroken, setHasBroken] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  
  const [backgroundHeight, setBackgroundHeight] = useState(0);
  const [backgroundShift, setBackgroundShift] = useState(-78);
  const [duelistShift, setDuelistShift] = useState(0);
  const [buttonEnterShift, setButtonEnterShift] = useState(0);
  const [buttonScale, setButtonScale] = useState(0);

  useEffect(() => {
    const entered = JSON.parse(sessionStorage.getItem('hasEntered') ?? 'false') === true
    
    setHasEntered(entered);
    setDisablePointer(JSON.parse(sessionStorage.getItem('disablePointer') ?? 'false') === true);
    setIsMuted(JSON.parse(localStorage.getItem('isMuted') ?? 'false') === true);

    if (entered) {
      setOverlayOpacity(0);
    }
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
      setButtonScale(0.6 * (displayWidth / displayHeight) + 0.4);
      console.log(0.6 * (displayWidth / displayHeight) + 0.4)
    } else if (buttonScale != 1) {
      setButtonScale(1);
    }
  }, [displayHeight, displayWidth]);

  const overlayControls = useAnimationControls();
  const textOverlayControls = useAnimationControls();
  const lineOverlayControls = useAnimationControls();
  const diamondOverlayControls = useAnimationControls();
  
  const aboutControls1 = useAnimation();
  const aboutControls2 = useAnimation();
  const aboutControls3 = useAnimation();
  const aboutControls4 = useAnimation();
  const aboutControls5 = useAnimation();

  const { scrollYProgress } = useScroll();
  const { scrollYProgress: aboutScrollYProgress } = useScroll({ target: aboutBlockRef});
  const backgroundTransformY = useTransform(scrollYProgress, [0, 0.15], [0, backgroundShift], {ease: easeInOut});
  
  const walkStart = 0.11
  const walkEnd = 0.89
  const buttonEnterEnd = 0.94
  const shootEnd = 1
  const duelistWalk = useTransform(scrollYProgress, [walkStart, walkEnd], ['0vw', '38vw']);
  const duelistShoot = useTransform(scrollYProgress, [walkEnd, shootEnd], [0, 1]);
  const buttonEnter = useTransform(scrollYProgress, [walkEnd, buttonEnterEnd], [1.1 * displayHeight, buttonEnterShift], {ease: easeIn});
  const buttonExit = useTransform(scrollYProgress, [buttonEnterEnd, shootEnd], [0, -100], {ease: easeOut});
  
  const clouds1Y = useTransform(scrollYProgress, [0, 0.15], ['0%', '60%']);
  const logoY = useTransform(scrollYProgress, [0, 0.15], ['0%', '50%']);
  const logoTextY = useTransform(scrollYProgress, [0, 0.15], ['0%', '60%']);
  const playButtonY = useTransform(scrollYProgress, [0.05, 0.25], ['0%', '70%']);
  const clouds2Y = useTransform(scrollYProgress, [0, 0.15], ['0%', '40%']);
  const clouds2Opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  // const introTextY = useTransform(scrollYProgress, [0.05, 0.25], ['0vh', '-75vh'], {ease: easeInOut});
  // const introTextOpacity = useTransform(scrollYProgress, [0.10, 0.17], [1, 0], {ease: easeInOut});

  const clouds1 = useMemo(() => generateCloudComponents(25, {min: 10, max: 30}, {min: 50, max: 350}, {min: 2, max: 40}, {min: 0, max: 12}), []);
  const clouds2 = useMemo(() => generateCloudComponents(6, {min: 20, max: 60}, {min: 300, max: 700}, {min: 35, max: 80}, {min: 10, max: 15}), []);
  const clouds2Foreground = useMemo(() => generateCloudComponents(4, {min: 20, max: 60}, {min: 400, max: 600}, {min: 35, max: 80}, {min: 15, max: 17}), []);

  const enterVariants: Variants = {
    offscreen: {
      y: '10vh',
      opacity: 0,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 1.2
      }
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 1.2
      }
    }
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (hasBroken) return;

    const regex = /frame_(\d+)\.png/;
    const match = duelistSrc.match(regex);
    const lastWalkFrame = match ? match[1] : 1;

    if (latest >= walkStart && latest < walkEnd) {
      const animationTime = ((walkEnd - walkStart) / 5)
      const currentFrame = Math.floor(((latest - walkStart) % animationTime) / (animationTime / 16)) + 1
      const frameNumber = ('000' + currentFrame.toString()).slice(-2)

      if (lastWalkFrame != currentFrame && currentFrame % 2 == 0 && currentFrame <= 16) {
        setDuelistSrc('/images/duelist/twosteps/frame_' + frameNumber + '.png')
      }
    } else if (latest < walkStart && lastWalkFrame != 1) {
        setDuelistSrc('/images/duelist/twosteps/frame_01.png')
    }
  })

  useMotionValueEvent(duelistShoot, "change", (latest) => {
    const regex = /frame_(\d+)\.png/;
    const match = duelistSrc.match(regex);
    const lastShootFrame = match ? parseInt(match[1]) : 1;

    const currentFrame = Math.floor(latest / (1 / 16)) + 1
    const frameNumber = ('000' + currentFrame.toString()).slice(-2)

    if (hasBroken && currentFrame == 16) return

    if (lastShootFrame != currentFrame && currentFrame <= 16) {
      if (hasBroken && lastShootFrame < 16) {
        setDuelistSrc('/images/duelist/shoot/frame_' + ('000' + (lastShootFrame + 1).toString()).slice(-2) + '.png')
      } else if (!hasBroken) {
        setDuelistSrc('/images/duelist/shoot/frame_' + frameNumber + '.png')
      }
    }

    if (currentFrame == 8 && breakButtonRef.current && !hasBroken && lastShootFrame < currentFrame && shotSoundRef.current && breakSoundRef.current) {
      setHasBroken(true);
      sessionStorage.setItem("hasBroken", "true")
      breakButtonRef.current.breakButton();
      shotSoundRef.current.play();
      breakSoundRef.current.play();
    }
  })

  useMotionValueEvent(aboutScrollYProgress, "change", (latest) => {
    if (latest > 0 && (sessionStorage.getItem("isAnim1Done") == 'false' || sessionStorage.getItem("isAnim1Done") == undefined)) {
      sessionStorage.setItem("isAnim1Done", "true");
      aboutControls1.start("onscreen");
    } else if (latest == 0 && sessionStorage.getItem("isAnim1Done") == 'true') {
      sessionStorage.setItem("isAnim1Done", "false");
      aboutControls1.start("offscreen");
    }

    if (latest > 0.25 && (sessionStorage.getItem("isAnim2Done") == 'false' || sessionStorage.getItem("isAnim2Done") == undefined)) {
      sessionStorage.setItem("isAnim2Done", "true");
      aboutControls2.start("onscreen");
    } else if (latest < 0.25 && sessionStorage.getItem("isAnim2Done") == 'true') {
      sessionStorage.setItem("isAnim2Done", "false");
      aboutControls2.start("offscreen");
    }

    if (latest > 0.45 && (sessionStorage.getItem("isAnim3Done") == 'false' || sessionStorage.getItem("isAnim3Done") == undefined)) {
      sessionStorage.setItem("isAnim3Done", "true");
      aboutControls3.start("onscreen");
    } else if (latest < 0.45 && sessionStorage.getItem("isAnim3Done") == 'true') {
      sessionStorage.setItem("isAnim3Done", "false");
      aboutControls3.start("offscreen");
    }

    if (latest > 0.65 && (sessionStorage.getItem("isAnim4Done") == 'false' || sessionStorage.getItem("isAnim4Done") == undefined)) {
      sessionStorage.setItem("isAnim4Done", "true");
      aboutControls4.start("onscreen");
    } else if (latest < 0.65 && sessionStorage.getItem("isAnim4Done") == 'true') {
      sessionStorage.setItem("isAnim4Done", "false");
      aboutControls4.start("offscreen");
    }

    if (latest > 0.85 && (sessionStorage.getItem("isAnim5Done") == 'false' || sessionStorage.getItem("isAnim5Done") == undefined)) {
      sessionStorage.setItem("isAnim5Done", "true");
      aboutControls5.start("onscreen");
    } else if (latest < 0.85 && sessionStorage.getItem("isAnim5Done") == 'true') {
      sessionStorage.setItem("isAnim5Done", "false");
      aboutControls5.start("offscreen");
    }
  });

  useEffect(() => {
    const handleWheel = (event: any) => {
      event.preventDefault();

      if(!hasEntered) return;

      smoothScroll(event)
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [smoothScroll]);

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
          duration: 2.5, ease: 'easeInOut', delay: 0.5
        }
      })
      animate(
        ".ExitText",
        { opacity: 0, y: 100 },
        {
          duration: 0.5,
          delay: stagger(0.2),
          ease: easeInOut
        }
      );
      animate(
        ".RadialGradient",
        { opacity: 0 },
        {
          duration: 0.4,
          delay: 0.5,
          ease: easeInOut
        }
      );
      smoothScrollToPercentage(0.114, 2500, () => {
        setHasEntered(true);
        setDisablePointer(true);
        sessionStorage.setItem("disablePointer", "true")
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
    if (audioRef.current && shotSoundRef.current && breakSoundRef.current) {
      if (!isMuted) {
        audioRef.current.volume = 0.15;
        shotSoundRef.current.volume = 0.5;
        breakSoundRef.current.volume = 0.5;
      } else {
        audioRef.current.volume = 0;
        shotSoundRef.current.volume = 0;
        breakSoundRef.current.volume = 0;
      }
    }
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
        <div id="overlay"
          style={{
            pointerEvents: disablePointer ? 'none' : 'auto',
            opacity: overlayOpacity
          }}
        >
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
            style={{
              position: 'fixed',
              top: 0, 
              left: 0, 
              width: '100%',
              height: '100%',
              zIndex: 10,
            }}
            onClick={() => playEnterAnimation()}
          >
            <m.div 
              className="DisplayFlex FlexColumn Centered RadialGradient"
              style={{
                position: 'absolute',
                top: '87vh',
                width: '100%',
              }}
            >
              <m.div animate={textOverlayControls} className="CenteredContainer FlexRow TextWidth">
                <m.h3 className="ExitText TextLeft">PRESS</m.h3>
                <m.h3 className="ExitText TextCenter">TO</m.h3>
                <m.h3 className="ExitText TextRight">ENTER</m.h3>
              </m.div>
              <div className="line-container">
                <m.div animate={lineOverlayControls} className="horizontal-line"></m.div>
                <m.div animate={diamondOverlayControls} className="diamond">
                  <div className="diamond-inner"></div>
                </m.div>
              </div>
            </m.div>
          </m.div>
        </div>
        <m.div className="PageBackground" style={{ y: backgroundTransformY }}>
          <div style={{ backgroundColor: '#808080', width: '100vw', height: backgroundHeight }}/>
          <Img ref={backgroundImageRef} src='/images/bg_duel.jpg' style={{ height: '100%', width: '100vw', zIndex: -1, y: -2 }} />
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
              src={duelistSrc}
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
              transform: 'translate(-50%, 0%) scaleX(-1)',
              position: 'absolute', 
              bottom: duelistShift,
              left: '46%', 
            }}
          >
            <m.img 
              src={duelistSrc}
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
        <m.div className="HeaderLayer" style={{ y: clouds1Y, zIndex: 1, overflowX: 'clip' }}>
          {clouds1}
        </m.div>
        <m.div className="HeaderLayer" style={{ y: logoY, zIndex: 2 }}>
          <Img
            src='/images/logo.png' 
            style={{ 
              position: 'absolute', 
              top: '30vh', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              height: '35vh', 
              width: 'auto',
              zIndex: 12 
            }} 
          />
        </m.div>
        <m.div className="HeaderLayer" style={{ y: logoTextY, zIndex: 2 }}>
          <Img 
            src='/images/logo_text.png' 
            style={{ 
              position: 'absolute', 
              top: '70vh', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              height: 'auto', 
              width: '60vmax', 
              maxHeight: '40vh',
              maxWidth: '40vmax',
              objectFit: 'contain',
              padding: 20,
              zIndex: 15 ,
            }}
          />
        </m.div>
        <m.div className="HeaderLayer DisplayFlex Centered" style={{ y: playButtonY, zIndex: 2, scale: buttonScale, top: '70vh' }}>
          <BreakingButton title="Play Game" onClick={() => window.location.href='https://pistols.lootunder.world/'} style={{  }}/>
        </m.div>
        <m.div className="HeaderLayer" style={{ y: clouds2Y, zIndex: 1, opacity: clouds2Opacity, overflowX: 'clip' }}>
          {clouds2}
        </m.div>
        <m.div className="HeaderLayer" style={{ y: clouds2Y, zIndex: 3, opacity: clouds2Opacity, overflowX: 'clip' }}>
          {clouds2Foreground}
        </m.div>
        {/* <m.div className="DisplayFlex FlexColumn Centered" style={{ position: 'absolute', top: '200vh', left: 0, right: 0, y: introTextY, opacity: introTextOpacity }}>
          <h1 className="Quote Black">"Thou art an offence to all that is decent, dog.</h1>
          <h1 className="Quote Black">I challenge you... to a duel!"</h1>
        </m.div> */}
        <div style={{ position: 'relative', width: '100%', top: '225vh', zIndex: 5 }}>
          <div className={`${displayWidth < 1200 ? "SpacerBottom" : "SpacerBottomTransparent"}`}/>
          <div id="About" ref={aboutBlockRef} className={`${displayWidth < 1200 ? "ParagraphBlack" : "ParagraphTransparent"}`}>
            {/* <img className="PageImage ImageRight" style={{ opacity: displayWidth < 900 ? 0 : 1 }} src='/images/bg_duel.jpg'/>
            <div className="ImageGradient"/>
            <div className="Page GradientBlack"/> */}
            <div className="Relative" style={{ padding: 20 }}>
              <m.h1 className="Title" style={{ marginBottom: 24, position: 'sticky', top: 20, zIndex: 10 }} variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>About</m.h1>
              {displayWidth < 1200 ? (
                <Grid container alignItems="center" justifyContent="center">
                  <Grid xs={12} md={6} xl={4} style={{ padding: 20 }}>
                    <p>A righteous smoulder in your eye and your smoothbore, flintlock pistol held lightly at your side, cocked and ready, you stand in the misty morning field. Holding back the gorge rising in your throat, you shake that mongrel's hand and turn, taking your first step. </p>
                    <p>Your feet crunch in the crisp morning grass, one step, two steps, three. You hear the snap of a cloak, the gasp of your second, and a sharp, booming crack, then your left arm explodes into pain. That traitorous scum shot early! </p>
                  </Grid>
                  <Grid xs={12} md={6} xl={4}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      style={{ padding: 40 }}
                    >
                      <Img
                        src='/images/pistol_closeup.png' 
                        style={{ 
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '1rem'
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid xs={12} md={6} xl={4} style={{ padding: 20 }}>
                    <p>Gritting your teeth against the pain, and without turning around, you keep stepping foward. Four, Five, Six, Seven, Eight, Nine... Ten. You turn around, slowly, a dark menace in your shoulder, and raise your pistol. The cur stands there, a defiant sneer upon his face, and throws his still smoking pistol to the ground. You take a deep breath, and whisper "May you find honour in death, you wretch!"</p>
                    <p>Blood sprays in a beautiful arc from his head, and he drops like a felled log. Silence, interrupteed only by the spattering of blood from your arm, into the morning grass.</p>
                  </Grid>
                  <Grid xs={12} md={6} xl={4}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      style={{ padding: 40 }}
                    >
                      <Img
                        src='/images/face_closeup_smirk.png' 
                        style={{ 
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '1rem'
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid xs={12} md={6} xl={4} style={{ padding: 20 }}>
                    <p>Pistols at 10 Blocks is an atmospheric on-chain mini-game, in which you face off against another Lord in a pistol duel to defend your honour. Do you duel with honour, or do you turn early and put them down like the wretched cue that they are?</p>
                  </Grid>
                  <Grid xs={12} md={6} xl={4}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      style={{ padding: 40 }}
                    >
                      <Img
                        src='/images/pistol_shot.png' 
                        style={{ 
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '1rem'
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <div style={{ height: '300vh', position: 'relative' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'sticky', top: '11vmin', zIndex: 10, height: 'calc(100vh - 5vmin - 64px)' }}>
                    <div className="DisplayFlex FlexColumn" style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ padding: 20 }}>
                        <m.p id="about1" style={{ marginBottom: 30 }} animate={aboutControls1} variants={enterVariants} initial="offscreen">A righteous smoulder in your eye and your smoothbore, flintlock pistol held lightly at your side, cocked and ready, you stand in the misty morning field. Holding back the gorge rising in your throat, you shake that mongrel's hand and turn, taking your first step. Your feet crunch in the crisp morning grass, one step, two steps, three. </m.p>
                        <m.p id="about2" style={{ marginBottom: 30 }} animate={aboutControls2} variants={enterVariants} initial="offscreen">You hear the snap of a cloak, the gasp of your second, and a sharp, booming crack, then your left arm explodes into pain. That traitorous scum shot early! </m.p>
                        <m.p id="about3" style={{ marginBottom: 30 }} animate={aboutControls3} variants={enterVariants} initial="offscreen">Gritting your teeth against the pain, and without turning around, you keep stepping foward. Four, Five, Six, Seven, Eight, Nine... Ten. You turn around, slowly, a dark menace in your shoulder, and raise your pistol. The cur stands there, a defiant sneer upon his face, and throws his still smoking pistol to the ground. You take a deep breath, and whisper "May you find honour in death, you wretch!"</m.p>
                        <m.p id="about4" style={{ marginBottom: 30 }} animate={aboutControls4} variants={enterVariants} initial="offscreen">Blood sprays in a beautiful arc from his head, and he drops like a felled log. Silence, interrupteed only by the spattering of blood from your arm, into the morning grass.</m.p>
                        <m.p id="about5" style={{ marginBottom: 30 }} animate={aboutControls5} variants={enterVariants} initial="offscreen">Pistols at 10 Blocks is an atmospheric on-chain mini-game, in which you face off against another Lord in a pistol duel to defend your honour. Do you duel with honour, or do you turn early and put them down like the wretched cue that they are?</m.p>
                      </div>
                    </div>
                    <div 
                      style={{ position: 'relative' }}>
                      <m.div 
                        style={{ 
                          width: '50%',
                          height: 'auto',
                          position: 'absolute',
                          top: '40%',
                          left: '44%',
                        }}
                        animate={aboutControls1} variants={enterVariants} initial="offscreen"
                      >
                        <img
                          id="aboutImage1"
                          src='/images/face_closeup.png' 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            borderRadius: '1rem',
                            transform: 'rotate(-10deg) translate(-50%, -50%)',
                            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.38)'
                          }}
                        />
                      </m.div>
                      <m.div 
                        style={{ 
                          width: '50%',
                          height: 'auto',
                          position: 'absolute',
                          top: '45%',
                          left: '47%',
                        }}
                        animate={aboutControls2} variants={enterVariants} initial="offscreen"
                      >
                        <img
                          id="aboutImage2"
                          src='/images/second_reaction.png' 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            borderRadius: '1rem',
                            transform: 'rotate(-5deg) translate(-50%, -50%)',
                            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.38)'
                          }}
                        />
                      </m.div>
                      <m.div 
                        style={{ 
                          width: '50%',
                          height: 'auto',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                        }}
                        animate={aboutControls3} variants={enterVariants} initial="offscreen"
                      >
                        <img
                          id="aboutImage3"
                          src='/images/pistol_closeup.png' 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            borderRadius: '1rem',
                            transform: 'rotate(0deg) translate(-50%, -50%)',
                            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.38)'
                          }}
                        />
                      </m.div>
                      <m.div 
                        style={{ 
                          width: '50%',
                          height: 'auto',
                          position: 'absolute',
                          top: '55%',
                          left: '53%',
                        }}
                        animate={aboutControls4} variants={enterVariants} initial="offscreen"
                      >
                        <img
                          id="aboutImage4"
                          src='/images/face_closeup_smirk.png' 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            borderRadius: '1rem',
                            transform: 'rotate(5deg) translate(-50%, -50%)',
                            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.38)'
                          }}
                        />
                      </m.div>
                      <m.div 
                        style={{ 
                          width: '50%',
                          height: 'auto',
                          position: 'absolute',
                          top: '60%',
                          left: '56%',
                        }}
                        animate={aboutControls5} variants={enterVariants} initial="offscreen"
                      >
                        <img
                          id="aboutImage5"
                          src='/images/pistol_shot.png' 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            borderRadius: '1rem',
                            transform: 'rotate(10deg) translate(-50%, -50%)',
                            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.38)'
                          }}
                        />
                      </m.div>
                    </div>
                  </div>
                </div>
              )} 
            </div>
          </div>
          <div className={`${displayWidth < 1200 ? "SpacerTopBottom" : "SpacerTopBottomTransparent"}`}/>
          <div id="GamePlay" className="ParagraphBlack">
            <img className="PageImage ImageRight" style={{ opacity: displayWidth < 900 ? 0 : 1 }} src='/images/bg_gameplay.jpg'/>
            <div className="ImageGradient"/>
            <div className="Page GradientBlack"/>
            <div className="DisplayFlex FlexColumn Relative" style={{ padding: 40 }}>
              <m.h1 className="Title" style={{ marginBottom: 24 }} variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>Gameplay</m.h1>
              <Grid container alignItems="center" justifyContent="center">
                <Grid xs={12} md={6} style={{ padding: 20 }}>
                  <m.div variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>
                    <p>To issue a challenge, a duelist selects an opponent profile and sets a timeout + deposit in $LORDS for the challenge. The recipient duelist must accept within the timeout and match the deposit, or forfeit the match.</p>
                    <p>Once the match commences, there are two rounds. Duelists have two health bars and an honour score out of 10.</p>
                  </m.div>
                </Grid>
                <Grid xs={12} md={6}>
                </Grid>
                <Grid xs={12} md={6} style={{ padding: 20 }}>
                  <m.h3 style={{ marginTop: 16 }} variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>Round 1: Pistols</m.h3>
                  <m.div variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>
                    <p>The first round is pistols at 10 paces. An honourable duel is fought at 10 paces, but a duelist - being the wretched cur that they are - may choose to turn and fire early, shooting their opponent dishonourably in the back. Moves are committed on-chain, but hidden from the opponent. Once both duelists have chosen at what distance to fire, the first round is resolved on-chain.</p>
                    <p>There are three outcomes possible for a shot. It may miss, it may be an injuring blow (half health damage), or it may kill the opponent outright. The closer a duelist fires, the higher their chance of hitting, but the lower their chance of a killing blow. Hit chance starts at 80% and drops to 20% at ten paces. Kill chance starts at 10% and increases to 100% at ten paces. So at ten paces, a duelist only has a 20% chance to hit, but has a 100% chance to kill if they do hit.</p>
                    <p>If a duelist misses and their opponent has not yet fired, they must stand, teeth gritted, and honourably contemplate their fate as they wait for the return shot. We later plan to introduce a feature allowing a duelist to fire into the ground, so that honour may be satisfied without bloodshed.</p>    
                  </m.div>
                </Grid>
                <Grid xs={12} md={6}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ padding: 40 }}
                  >
                    <m.div variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>
                      <Img
                        src='/images/choose_steps.png' 
                        style={{ 
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '1rem',
                          boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.38)'
                        }}
                      />
                    </m.div>
                  </Box>
                </Grid>
                <Grid xs={12} md={6} style={{ padding: 20 }}>
                  <m.h3 style={{ marginTop: 16 }} variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>Round 2: Blades</m.h3>
                  <m.div id="listP" variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>
                    <p>If both duelists survive round 1 with half or full health, the match proceeds to round 2, blades. This is a rock-scissors-paper dynamic. Each duelist may select one of six options:</p>
                    <ol>
                      <li>Light blade (injures, strikes first)</li>
                      <li>Heavy blade (kills, strikes last)</li>
                      <li>Block (blocks a light blade)</li>
                      <li>Steal (try to steal your foes wager)</li>
                      <li>Sepoku (commit sepoku, perserve your honor)</li>
                      <li>Flee ("That's right, flee, you dishonourable dog!")</li>
                    </ol>
                  </m.div>
                </Grid>
                <Grid xs={12} md={6}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ padding: 40 }}
                  >
                    <m.div variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>
                      <Img
                        src='/images/choose_blades2.png' 
                        style={{ 
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '1rem',
                          boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.38)'
                        }}
                      />
                    </m.div>
                  </Box>
                </Grid>
                <Grid xs={12} md={6} style={{ padding: 20 }}>
                  <m.h3 style={{ marginTop: 16 }} variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>Match Resolution</m.h3>
                  <m.div variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>
                    <p>If the recipient of the challenge fails to show, or either duelist fails to submit their move, the match is dishonourably abandoned by the duelist who failed to show.</p>
                    <p>If both duelists live, or both lie slain upon that morning field, then the match is a draw.</p>
                    <p>If one duelist is slain, but the other lives on, then the match is a victory in favour of the living duelist.</p>
                    <p>The $LORDS deposit, minus a fee of 10% (with a minimum 10 $LORDS), is then paid to the victor and the results of the match recorded permanently on-chain. In this way, all can see the match history and overall how honourably each lord plays.</p>
                  </m.div>
                </Grid>
                <Grid xs={12} md={6}>
                </Grid>
              </Grid>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 64 }}>
                <m.div 
                  style={{ borderStyle: 'solid', borderWidth: 1.5, borderRadius: 12, borderColor: 'white', backgroundColor: '#222222', width: 'auto', height: 48, marginTop: '24px', padding: '24px', alignContent: 'center', textAlign: 'center'}}
                  whileHover={{ scale: 1.1, filter: "brightness(1.3)" }}
                  onClick={() => window.location.href='https://underware.gg/'}
                >
                  <h1 style={{ width: '100%', height: 'auto', fontSize: '1.6em', cursor: 'default' }}>Read more on our official docs</h1>
                </m.div>
              </div>
            </div>
          </div>
          <div className="SpacerTopBottom"/>
          <div id="Team" className="ParagraphBlack">
            <img className="PageImage ImageRight" src='/images/bg_team.jpg'/>
            <div className="ImageGradient"/>
            <div className="Page GradientBlack"/>
            <div className="PagePadded DisplayFlex FlexColumn">
              <m.h1 className="Title" style={{ marginBottom: 24 }} variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>Team</m.h1>
              <div className="DisplayFlex FlexColumn Relative Flex1" style={{ width: '100%', overflow: 'visible' }}>
                <InfiniteHorizontalScroll images={teamData} direction={ScrollDirection.LEFT} imageHeight={'60vh'} imageWidth={`${60 / 1.777778}vh`} isContentCard={true}/>
              </div>
            </div>
          </div>
          <div className="SpacerTopBottom"/>
          <div id="Assets" className="ParagraphBlack">
            <img className="PageImage" src='/images/bg_assets.jpg'/>
            <div className="ImageGradient"/>
            <div className="PagePadded DisplayFlex FlexColumn">
              <m.h1 className="Title" style={{ marginBottom: 24 }} variants={enterVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }}>Assets</m.h1>
              <div className="DisplayFlex FlexColumn Relative Flex1" style={{ width: '100%', overflow: 'visible' }}>
                <InfiniteHorizontalScroll images={assetsImageSources} direction={ScrollDirection.LEFT} imageHeight={'25vh'} imageWidth={'25vh'} isContentCard={false}/>
                <InfiniteHorizontalScroll images={profileImageSources} direction={ScrollDirection.RIGHT} imageHeight={'25vh'} imageWidth={'25vh'} isContentCard={false}/>
              </div>
            </div>
          </div>
          <div className="SpacerTop"/>
          <div style={{ height: '50vh',  minHeight: 600, width: '100%' }}/>
          <div className="Paragraph DisplayFlex" style={{ flexDirection: 'column-reverse' }}>
            <m.div ref={breakButtonContainerRef} className="DisplayFlex Centered" style={{ position: 'fixed', y: buttonExit, top: buttonEnter, left: 0, right: 0, scale: buttonScale }}>
              <BreakingButton title="Play Game" ref={breakButtonRef} onClick={() => window.location.href='https://pistols.lootunder.world/'} style={{  }}/>
            </m.div>
            <div style={{  }}>

            </div>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', backgroundColor: '#222222', paddingTop: '40px', paddingLeft: '8vw', paddingRight: '9vw', paddingBottom: '30px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ color: 'lightgray', fontWeight: 400, marginBottom: '20px' }}>FOLLOW OUR WORK:</h4>
                <div style={{ flex: 1,  display: 'flex', flexDirection: 'row', alignItems: 'center', justifyItems: 'flex-start' }}>
                  <m.div 
                    style={{ borderStyle: 'solid', borderWidth: 1.5, borderRadius: 12, borderColor: 'white', backgroundColor: '#5865F2', width: 58, height: 58, marginRight: '24px', padding: '12px', alignContent: 'flex-end', justifyContent: 'center'}}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => window.location.href='https://discord.gg/XcbjHRVRwQ'}
                  >
                    <img style={{ width: '100%', height: 'auto' }} src="images/icon/icon_discord.png"/>
                  </m.div>
                  <m.div 
                    style={{ borderStyle: 'solid', borderWidth: 1.5, borderRadius: 12, borderColor: 'white', backgroundColor: 'black', width: 58, height: 58, marginRight: '24px', padding: '16px', justifyContent: 'center'}}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => window.location.href='https://twitter.com/underware_gg'}
                  >
                    <img style={{ width: 'auto', height: '100%' }} src="images/icon/icon_x.png"/>
                  </m.div>
                  <m.div 
                    style={{ borderStyle: 'solid', borderWidth: 1.5, borderRadius: 12, borderColor: 'white', backgroundColor: 'rebeccapurple', width: 58, height: 58, marginRight: '24px', padding: '12px', alignContent: 'center', textAlign: 'center'}}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => window.location.href='https://underware.gg/'}
                  >
                    <h1 style={{ width: '100%', height: 'auto', fontSize: '3em', cursor: 'default' }}>U</h1>
                  </m.div>
                </div>
              </div>
              {/* <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <m.div 
                    style={{ borderStyle: 'solid', borderWidth: 1.5, borderRadius: 12, borderColor: 'white', backgroundColor: '#303030', width: 'auto', height: 58, marginRight: '24px', padding: '36px', alignContent: 'center', textAlign: 'center'}}
                    whileHover={{ scale: 1.1, filter: "brightness(1.3)" }}
                    onClick={() => window.location.href='https://underware.gg/'}
                  >
                    <h1 style={{ width: '100%', height: 'auto', fontSize: '2em', cursor: 'default' }}>CONTACT US</h1>
                  </m.div>
              </div> */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <a href="https://underware.gg/"><p style={{ fontSize: '1.5em' }}>❤️ With Love by Underware.gg</p></a>
              </div>
            </div>
          </div>
        </div>

        <div>
          <audio ref={audioRef} loop autoPlay>
            <source src="/audio/biodecay-song6.mp3" type="audio/mp3" />
          </audio>
          <audio ref={shotSoundRef} src="/audio/sfx/pistol-shot.mp3" />
          <audio ref={breakSoundRef} src="/audio/sfx/pistol-shot.mp3"/>
          <m.div 
            style={{ borderStyle: 'solid', borderWidth: 1.5, borderRadius: 8, borderColor: 'black', backgroundColor: 'lightGray', position: 'fixed', top: 0, right: 0, margin: '2rem 2rem', width: 36, height: 36, padding: 6, zIndex: 100, justifyContent: 'center' }}
            whileHover={{ scale: 1.2 }}
            onClick={() => toggleMute()}
          >
            <img style={{ width: 'auto', height: '100%' }} src={isMuted ? '/images/icon/icon_volume-off.svg' : '/images/icon/icon_volume-on.svg'} />
          </m.div>
        </div>
      </div>
    </App>
  )
}

const assetsImageSources = [
  '/images/bg_duel.jpg', 
  '/images/bg_about.jpg', 
  '/images/bg_assets.jpg',
  '/images/bg_gameplay.jpg',
  '/images/bg_gameplay2.jpg',
  '/images/bg_team.jpg',
  '/images/logo.png',
];

const profileImageSources = [
  '/images/profiles/01_a.jpg', 
  '/images/profiles/02_a.jpg', 
  '/images/profiles/03_a.jpg', 
  '/images/profiles/04_a.jpg', 
  '/images/profiles/05_a.jpg', 
  '/images/profiles/06_a.jpg', 
  '/images/profiles/07_a.jpg', 
  '/images/profiles/08_a.jpg', 
  '/images/profiles/09_a.jpg', 
  '/images/profiles/10_a.jpg', 
  '/images/profiles/11_a.jpg', 
  '/images/profiles/12_a.jpg', 
  '/images/profiles/13_a.jpg', 
  '/images/profiles/14_a.jpg', 
  '/images/profiles/15_a.jpg', 
];

const teamData = [
  '/images/teamphotos/dark_alchemist.webp', 
  '/images/teamphotos/dark_architect.webp', 
  '/images/teamphotos/dark_scribe.webp', 
  '/images/teamphotos/dark_sorceress.webp', 
  '/images/teamphotos/dark_lord.png', 
  '/images/teamphotos/dark_scribe2.webp', 
  '/images/teamphotos/dark_sorceress2.webp', 
]