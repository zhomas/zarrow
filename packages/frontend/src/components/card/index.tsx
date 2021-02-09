import React, { FC } from 'react'
import { CardModel } from 'game'
import { motion } from 'framer-motion'
import type { FluidCardProps } from '../../typings'

type Props = FluidCardProps

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
  onSelect,
  onMouseEnter,
  onMouseExit,
  selected,
  variant = 'default',
}) => {
  const getBGColor = () => {
    switch (variant) {
      case 'disabled':
        return '#d5d5d5'
      case 'lowlight':
        return '#abd6ff'
      case 'highlight':
        return '#abd6ff'
      default:
        return 'white'
    }
  }

  return (
    <motion.div
      layoutId={card.id}
      onClick={onClick}
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
        <div>
          {(!!onSelect || !!selected) && (
            <>
              <input
                key={(!!selected).toString()}
                type="checkbox"
                checked={!!selected}
                onMouseOver={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  //console.log('click!')
                }}
                onChange={(e) => {
                  console.log('change')
                  onSelect && onSelect(!!e.target.value)
                }}
              />
            </>
          )}
        </div>
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
          borderRadius: 10,
          border: '1px solid black',
        }}
      ></div>
    </motion.div>
  )
}
