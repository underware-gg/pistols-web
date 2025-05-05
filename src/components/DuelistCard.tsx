import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { InteractibleComponent, InteractibleComponentHandle, InteractibleComponentProps, DUELIST_CARD_WIDTH } from './InteractibleComponent'
import { Grid, GridRow, GridColumn, Image } from 'semantic-ui-react'
import ProgressBar from './ProgressBar'
import { useAspectSize } from '@/hooks/useAspectSize'

interface DuelistCardProps extends InteractibleComponentProps {
  imageUrl: string
  archetypeImage: string
  name: string
  emoji: string
  isSmall?: boolean
  isAnimating?: boolean

  showBack?: boolean
  animateFlip?: (showBack: boolean) => void
}

export interface DuelistCardHandle extends InteractibleComponentHandle {
}

export const DuelistCard = forwardRef<DuelistCardHandle, DuelistCardProps>((props: DuelistCardProps, ref: React.Ref<DuelistCardHandle>) => {
  const baseRef = useRef<InteractibleComponentHandle>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { aspectWidth } = useAspectSize();

  useImperativeHandle(ref, () => ({
    flip: (flipped, isLeft, duration, easing, interpolation) =>
      baseRef.current?.flip(flipped, isLeft, duration, easing, interpolation),
    setPosition: (x, y, duration, easing, interpolation) =>
      baseRef.current?.setPosition(x, y, duration, easing, interpolation),
    setScale: (scale, duration, easing, interpolation) =>
      baseRef.current?.setScale(scale, duration, easing, interpolation),
    setRotation: (rotation, duration, easing, interpolation) =>
      baseRef.current?.setRotation(rotation, duration, easing, interpolation),
    setZIndex: (index, backgroundIndex) =>
      baseRef.current?.setZIndex(index, backgroundIndex),
    toggleVisibility: (isVisible) =>
      baseRef.current?.toggleVisibility(isVisible),
    toggleHighlight: (isHighlighted, shouldBeWhite, color) =>
      baseRef.current?.toggleHighlight(isHighlighted, shouldBeWhite, color),
    toggleDefeated: (isDefeated) =>
      baseRef.current?.toggleDefeated(isDefeated),
    playHanging: () => baseRef.current?.playHanging(),
    toggleIdle: (isPlaying) => baseRef.current?.toggleIdle(isPlaying),
    toggleBlink: (isBlinking, duration) => baseRef.current?.toggleBlink(isBlinking, duration),
    getStyle: () => baseRef.current?.getStyle() || { translateX: 0, translateY: 0, rotation: 0, scale: 1 },
  }));

  const _nameLength = (name: string) => {
    return name ? Math.floor(name.length / 10) : 31
  }

  useEffect(() => {
    if (!imageRef.current) return;

    let baseWidth = (props.width ?? DUELIST_CARD_WIDTH) * 0.7;
    let baseHeight = baseWidth;

    imageRef.current.style.setProperty('--profile-pic-width', `${aspectWidth(baseWidth)}px`);
    imageRef.current.style.setProperty('--profile-pic-height', `${aspectWidth(baseHeight)}px`);

  }, [props.width, aspectWidth]);

  //Just works this way, ask @mataleone why hahaha - stolen from duelist.tsx
  const SVG_WIDTH = 771;
  const SVG_HEIGHT = 1080;

  return (
    <InteractibleComponent
      width={aspectWidth(props.width)}
      height={aspectWidth(props.height)}
      isLeft={props.isLeft}
      isFlipped={props.isFlipped}
      isVisible={props.isVisible}
      isSelected={props.isSelected}
      isDisabled={props.isDisabled}
      isDraggable={props.isDraggable}
      isHighlightable={props.isHighlightable}
      isHanging={props.isHanging}
      isHangingLeft={props.isHangingLeft}
      shouldSwing={props.shouldSwing}
      instantFlip={props.instantFlip}
      instantVisible={props.instantVisible}
      hasBorder={true}
      mouseDisabled={!props.isSmall}
      hasCenteredOrigin={props.hasCenteredOrigin}
      onHover={props.onHover}
      onClick={props.onClick}
      frontImagePath={props.archetypeImage}
      backgroundImagePath={"/images/duelistCards/card_back.png"}
      defaultHighlightColor={props.defaultHighlightColor}
      startPosition={props.startPosition}
      startRotation={props.startRotation}
      startScale={props.startScale}
      ref={baseRef}
      childrenBehindFront={
        <>
          <Image ref={imageRef} src={props.imageUrl} alt={`${props.name} duelist portrait`} className='ProfilePic NoDrag duelist-card-image-drawing' />
        </>
      }
      childrenInFront={
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            preserveAspectRatio="xMinYMin meet"
          >
            <style>
              {`
                text{
                  fill:#200;
                  text-shadow:0.05rem 0.05rem 2px #2008;
                  font-size:28px;
                  font-family:Garamond;
                  dominant-baseline:middle;
                  text-anchor:middle;
                  -webkit-user-select:none;
                  -moz-user-select:none;
                  -ms-user-select:none;
                  user-select:none;
                }
                .DuelistNameSVG{
                  font-weight:bold;
                  font-variant-caps:small-caps;
                }
              `}
            </style>
            <path id="circle" d={`M${92},350a200,200 0 1,1 ${SVG_WIDTH - 184},0`} fill="none" stroke="none" />
            <text 
              className="DuelistNameSVG" 
              style={{
                fontSize: `${Math.min(60, 460 / (props.name.length * 0.5))}px`
              }}
            >
              <textPath startOffset="50%" xlinkHref="#circle">
                {props.name}
              </textPath>
            </text>
          </svg>

          {/* <DuelistTokenArt duelistId={props.duelistId} className='Absolute' /> */}
          <div className='InDuelEmoji'>
            {true &&
              <i>
                {'🔫'}
              </i>
            }
          </div>
          <div className='HounourCircle'>
            {props.emoji}
          </div>
          <div className="duelist-card-details">
            <>
              <div className="duelist-fame">
                <span style={{ fontSize: '16px' }}>
                  <span>⭐️</span>
                  3
                </span>
              </div>
              <ProgressBar className='FameProgressBar' value={Math.random() * 1000} total={1000} width={props.width * 0.8} height={props.height * 0.2} hideValue={true} />
              <div className="duelist-name small" data-contentlength={_nameLength("Genesis")}>Genesis</div>
            </>
          </div>
        </>
      }
    />
  )
})

DuelistCard.displayName = 'DuelistCard';