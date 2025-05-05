import React, { useMemo, useRef, useState, useCallback } from 'react'
import TWEEN from '@tweenjs/tween.js'
import { CARD_ASPECT_RATIO, DUELIST_CARD_HEIGHT, DUELIST_CARD_WIDTH } from './InteractibleComponent'
import { DuelistCard, DuelistCardHandle } from './DuelistCard'
import { useAspectSize } from '@/hooks/useAspectSize';

const HAND_CARD_WIDTH = 70
const HAND_CARD_HEIGHT = HAND_CARD_WIDTH * (1080/1920)
const CARDS_PER_PAGE = 5
const MAX_FAN_ANGLE = 80
const CARD_SPACING = 10
const SPREAD_ANGLE_INCREASE = 15 // Additional angle when spreading
const SPREAD_SPACING_INCREASE = 15 // Additional spacing when spreading

export default function SelectDuelistModal() {
  const { aspectWidth } = useAspectSize();

  const bottomCardRef = useRef<HTMLImageElement>(null)
  const topCardRef = useRef<HTMLImageElement>(null)
  const duelistCardRefs = useRef<(DuelistCardHandle | null)[]>([])

  const [isAnimating, setIsAnimating] = useState(false)

  const isAnimatingRef = useRef(false)

  const getCardPositioning = useCallback((index: number, totalCards: number, hoveredIndex: number = -1) => {
    if (totalCards === 1) {
      return { angle: 0, xOffset: 0, yOffset: 0 }
    }

    // Calculate relative position from center
    const centerOffset = (totalCards - 1) / 2
    const relativeIndex = index - centerOffset

    // Scale fan angle based on number of cards
    let fanAngle = (totalCards / CARDS_PER_PAGE) * MAX_FAN_ANGLE
    let angle = relativeIndex * (fanAngle / (totalCards - 1))
    
    // Scale spacing based on number of cards
    const spacingMultiplier = totalCards / CARDS_PER_PAGE
    let xOffset = relativeIndex * (CARD_SPACING * spacingMultiplier)
    let yOffset = Math.abs(relativeIndex) * 10

    // Adjust fan when a card is hovered
    if (hoveredIndex !== -1 && index !== hoveredIndex) {
      const isLeft = index < hoveredIndex
      const isRight = index > hoveredIndex
      
      if (isLeft) {
        // Increase angle and spacing for left side cards
        angle -= SPREAD_ANGLE_INCREASE
        xOffset -= SPREAD_SPACING_INCREASE
        yOffset += 5
      } else if (isRight) {
        // Increase angle and spacing for right side cards
        angle += SPREAD_ANGLE_INCREASE
        xOffset += SPREAD_SPACING_INCREASE
        yOffset += 5
      }
    }

    return { angle, xOffset, yOffset }
  }, [])

  const updateAllCardPositions = useCallback((hoveredIndex: number = -1) => {
    Array.from({ length: 3 }).forEach((_, index) => {
      if (index === hoveredIndex) return
      const card = duelistCardRefs.current[index]
      if (card) {
        const { angle, xOffset, yOffset } = getCardPositioning(index, 3, hoveredIndex)
        card.setPosition(xOffset, yOffset, 400, TWEEN.Easing.Quadratic.Out)
        card.setRotation(angle, 400, TWEEN.Easing.Quadratic.Out)
      }
    })
  }, [getCardPositioning])

  const hoverTimeout = useRef<NodeJS.Timeout>()

  const handleCardHover = useCallback((isHovered: boolean, index: number) => {
    if (isAnimatingRef.current) {
      clearTimeout(hoverTimeout.current)
      if (isHovered) {
        hoverTimeout.current = setTimeout(() => {
          handleCardHover(isHovered, index)
        }, 100)
      }
      return
    }
    
    const card = duelistCardRefs.current[index]
    if (card) {
      const { angle, xOffset, yOffset } = getCardPositioning(index, 3)
      
      // Calculate hover offsets based on card angle
      const angleRad = angle * Math.PI / 180
      const hoverDistance = 30
      const hoverXOffset = Math.sin(angleRad) * hoverDistance
      const hoverYOffset = -Math.abs(Math.cos(angleRad)) * hoverDistance - 20
      
      card.setScale(isHovered ? 1 : 1, 400, TWEEN.Easing.Quadratic.Out)
      card.toggleHighlight(isHovered)
      card.setZIndex(isHovered ? 10 : 0)
      card.setPosition(
        xOffset + (isHovered ? hoverXOffset : 0),
        yOffset + (isHovered ? hoverYOffset : 0),
        400,
        TWEEN.Easing.Quadratic.Out
      )
      
      // Update positions of other cards
      updateAllCardPositions(isHovered ? index : -1)
    }
  }, [getCardPositioning, updateAllCardPositions, isAnimating])

  // Memoize the duelist cards to prevent unnecessary re-renders
  const duelistCardsMemo = useMemo(() => {
    const images = [
      '/images/duelistCards/16.jpg',
      '/images/duelistCards/12.jpg',
      '/images/duelistCards/11.jpg',
    ]
    const archetypeImages = [
      '/images/duelistCards/card_circular_villainous.png',
      '/images/duelistCards/card_circular_trickster.png',
      '/images/duelistCards/card_circular_honourable.png',
    ]

    const emojis = [
      '👺',
      '🃏',
      '👑',
    ]

    const names = [
      'Shadowfax',
      'Loaf',
      'Lady Vengeance',
    ]
    
    return Array.from({ length: 3 }).map((_, index) => {
      const { angle, xOffset, yOffset } = getCardPositioning(index, 3)
      
      return (
        <DuelistCard
          key={index}
          ref={el => {
            if (el) {
              duelistCardRefs.current[index] = el
            }
          }}
          imageUrl={images[index]}
          archetypeImage={archetypeImages[index]}
          name={names[index]}
          emoji={emojis[index]}
          isSmall={true}
          isLeft={true}
          isVisible={true}
          instantVisible={true}
          isFlipped={true}
          instantFlip={true}
          isHanging={false}
          isHighlightable={false}
          isAnimating={isAnimating}
          width={DUELIST_CARD_WIDTH}
          height={DUELIST_CARD_HEIGHT}
          startRotation={angle}
          startPosition={{ x: xOffset, y: yOffset }}
          onHover={(isHovered) => handleCardHover(isHovered, index)}
        />
      )
    })
  }, [
    getCardPositioning, 
    isAnimating, 
    handleCardHover, 
  ])

  return (
    <div className='DuelistModalContainer NoMouse NoDrag'>
      <img 
        ref={bottomCardRef}
        className='HandCard NoMouse NoDrag' 
        src='/images/hand_card_multiple_bottom.png'
        alt="Card hand bottom"
        style={{
          width: aspectWidth(HAND_CARD_WIDTH),
          height: aspectWidth(HAND_CARD_HEIGHT)
        }}
      />
      
      <div className='CardContainer'>
        {duelistCardsMemo}
      </div>

      <img 
        ref={topCardRef}
        className='HandCard NoMouse NoDrag' 
        src='/images/hand_card_multiple_top.png'
        alt="Card hand top"
        style={{
          width: aspectWidth(HAND_CARD_WIDTH),
          height: aspectWidth(HAND_CARD_HEIGHT),
          zIndex: 11
        }}
      />
    </div>
  )
}
