import React, { FC } from 'react'
import { motion, MotionStyle } from 'framer-motion'
import { styled } from '@linaria/react'

type Props = MotionStyle & {
  point: 'up' | 'down' | 'left' | 'right'
}

const Wrapper = styled(motion.div)`
  position: absolute;
  width: 30px;
  height: 30px;
  margin: 16px;
  display: flex;
  align-items: center;
`

const Triangle = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 15px 20px 15px;
  border-color: transparent transparent #ffdf40 transparent;
`

const getDegrees = (point: Props['point']) => {
  switch (point) {
    case 'up':
      return 0
    case 'down':
      return 180
    case 'right':
      return 90
    default:
      return 0
  }
}

export const Throbber: FC<Props> = ({ point, ...style }) => {
  return (
    <Wrapper
      layoutId="throbber"
      style={{ ...style }}
      animate={{ rotate: getDegrees(point) }}
    >
      <motion.div
        animate={{ translateY: [0, 10, 0] }}
        transition={{
          repeatType: 'loop',
          repeat: Infinity,
          duration: 0.45,
        }}
      >
        <Triangle />
      </motion.div>
    </Wrapper>
  )
}
