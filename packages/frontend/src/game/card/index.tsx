import React, { FC, useEffect } from 'react'
import { AnimationProps, motion } from 'framer-motion'
import type { FluidCardProps } from '../../typings'
import { styled } from '@linaria/react'
import { CARD_FLIGHT_TIME } from 'game'

export const CARD_SIZE = {
  width: 126 * 0.85,
  height: 176 * 0.85,
}

type Props = FluidCardProps & {
  stackIndex?: number
  stackLength?: number
  style?: React.CSSProperties
  animate?: AnimationProps['animate']
}

const CardBack = styled.div`
  width: ${CARD_SIZE.width}px;
  height: ${CARD_SIZE.height}px;
  background: #d71010;
  position: absolute;
  top: 0;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  border-radius: 10px;
  border: 1px solid black;
`

const CardFace = styled.div`
  border-radius: 10px;
  border: 1px solid #00000075;
  position: absolute;
  width: ${CARD_SIZE.width}px;
  height: ${CARD_SIZE.height}px;
  top: 0;
  left: 0;

  text-align: left;
  padding: 10px;
  z-index: 2;

  backface-visibility: hidden;
`

const Wrapper = styled(motion.div)`
  width: ${CARD_SIZE.width}px;
  height: ${CARD_SIZE.height}px;
  position: relative;
  transform-style: preserve-3d;
`
const WrapperWrapper = styled.div`
  flex: 1 1 40px;
  min-width: 25px;
  max-width: fit-content;

  max-height: ${CARD_SIZE.height}px;
`

const Checkbox = styled.input`
  transform: scale(1.5);
`

export const FluidCard: FC<Props> = ({
  card,
  faceDown,
  onClick,
  onSelect,
  onMouseEnter,
  onMouseExit,
  selected,
  selectable = false,
  variant = 'default',
  style,
  stackIndex = 0,
}) => {
  const getBGColor = () => {
    switch (variant) {
      case 'disabled':
        return '#d5d5d5'
      case 'lowlight':
        return '#abd6ff'
      case 'highlight':
        return '#abd6ff'
      case 'golden':
        return '#FFE135'
      case 'idle':
        return '#e1dbba'
      default:
        return '#ffffff'
    }
  }

  return (
    <WrapperWrapper style={{ ...style }}>
      <Wrapper
        onClick={onClick}
        onMouseMove={onMouseEnter}
        onMouseOutCapture={onMouseExit}
        onContextMenuCapture={onSelect}
        onMouseOverCapture={onMouseEnter}
        layoutId={card.id}
        initial={{
          rotateY: faceDown ? 180 : 0,
        }}
        animate={{
          rotateY: faceDown ? 180 : 0,
          y: selected ? -20 : 0,
          transition: {
            type: 'tween',
            ease: 'easeOut',
          },
        }}
        transition={{
          y: {
            type: 'tween',
            duration: 100,
          },
        }}
        style={{
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <motion.div>
          <CardFace
            style={{
              backgroundColor: getBGColor(),
              color: card.suit === 'D' || card.suit === 'H' ? 'red' : 'black',
            }}
          >
            <span>
              {card.value}
              {card.suit}
            </span>
          </CardFace>
          <CardBack />
        </motion.div>
      </Wrapper>
    </WrapperWrapper>
  )
}
