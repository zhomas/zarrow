import React, { FC } from 'react'
import { CardModel } from 'game'
import { motion } from 'framer-motion'

type Props = {
  card: CardModel
  uiState?: 'highlight' | 'lowlight' | 'greyed' | 'default'
  faceDown?: boolean
  disabled?: boolean
  onClick?: () => void
  onRightClick?: () => void
  onMouseEnter?: () => void
  onMouseExit?: () => void
  multiSelected?: boolean
}

export const EmptyCard = () => {
  return (
    <div
      style={{
        height: 200,
        width: 140,
        borderRadius: 10,
        border: '1px solid black',
        position: 'relative',
        backgroundColor: 'white',
        padding: 10,
      }}
    ></div>
  )
}

const variants = {
  faceUp: {
    rotateY: 0,
  },
  faceDown: {
    rotateY: -180,
  },
}

export const FluidCard: FC<Props> = ({
  card,
  faceDown,
  onClick,
  onRightClick,
  onMouseEnter,
  onMouseExit,
  uiState = 'default',
}) => {
  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    !!onRightClick && onRightClick()
  }

  const getBGColor = () => {
    switch (uiState) {
      case 'greyed':
        return 'grey'
      case 'lowlight':
        return 'teal'
      case 'highlight':
        return 'blue'
      default:
        return 'white'
    }
  }

  return (
    <motion.div
      layoutId={card.id}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseOverCapture={onMouseEnter}
      onMouseOutCapture={onMouseExit}
      style={{
        width: 140,
        height: 200,
        cursor: !!onClick ? 'pointer' : 'default',
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
      variants={variants}
      animate={faceDown ? 'faceDown' : 'faceUp'}
    >
      <div
        style={{
          borderRadius: 10,
          border: '1px solid black',
          position: 'absolute',
          width: 140,
          height: 200,
          top: 0,
          left: 0,
          backgroundColor: getBGColor(),
          textAlign: 'left',
          padding: 10,
          zIndex: 2,
          color: card.suit === 'D' || card.suit === 'H' ? 'red' : 'black',
          backfaceVisibility: 'hidden',
        }}
      >
        <span>
          {card.value}
          {card.suit}
        </span>
      </div>
      <div
        style={{
          width: 140,
          height: 200,
          background: 'red',
          position: 'absolute',
          top: 0,

          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      ></div>
    </motion.div>
  )
}
