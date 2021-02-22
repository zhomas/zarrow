import React, { FC } from 'react'
import { AnimationProps, motion } from 'framer-motion'
import type { FluidCardProps } from '../../typings'
import { styled } from '@linaria/react'

type Props = FluidCardProps & {
  keyPrefix?: string
  stackIndex?: number
  stackLength?: number
  style?: React.CSSProperties
  animate?: AnimationProps['animate']
}

const CardBack = styled.div`
  width: 126px;
  height: 176px;
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
  width: 126px;
  height: 176px;
  top: 0;
  left: 0;

  text-align: left;
  padding: 10px;
  z-index: 2;

  backface-visibility: hidden;
`

const Wrapper = styled(motion.div)`
  width: 126px;
  height: 176px;
  cursor: default;
  position: relative;
  transform-style: preserve-3d;
`
const WrapperWrapper = styled.div`
  flex: 1 1 40px;
  min-width: 25px;
  max-width: fit-content;
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
  style,
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
        layoutId={`${keyPrefix}${card.id}`}
        onClick={onClick}
        onMouseOverCapture={onMouseEnter}
        onMouseOutCapture={onMouseExit}
        initial={{
          rotateY: faceDown ? -180 : 0,
        }}
        animate={{
          rotateY: faceDown ? -180 : 0,
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
      </Wrapper>
    </WrapperWrapper>
  )
}