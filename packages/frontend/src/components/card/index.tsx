import React, { FC } from 'react'
import { CardModel } from 'game'
import { motion } from 'framer-motion'
import type { FluidCardProps } from '../../typings'
import { styled } from '@linaria/react'

type Props = FluidCardProps & { keyPrefix?: string }

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

const CardBack = styled.div`
  width: 140px;
  height: 200px;
  background: red;
  position: absolute;
  top: 0;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  border-radius: 10px;
  border: 1px solid black;
`

const CardFace = styled.div`
  border-radius: 10px;
  border: 1px solid black;
  position: absolute;
  width: 140px;
  height: 200px;
  top: 0;
  left: 0;

  text-align: left;
  padding: 10px;
  z-index: 2;

  backface-visibility: hidden;
`

export const FluidCard: FC<Props> = ({
  card,
  faceDown,
  onClick,
  onSelect,
  onMouseEnter,
  onMouseExit,
  selected,
  variant = 'default',
  keyPrefix = '',
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
      layoutId={`${keyPrefix}${card.id}`}
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
      </CardFace>
      <CardBack />
    </motion.div>
  )
}
