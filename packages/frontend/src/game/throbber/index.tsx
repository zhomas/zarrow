import React, { FC } from 'react'
import { motion, MotionStyle } from 'framer-motion'
import { styled } from '@linaria/react'

type Props = MotionStyle & {
  point: 'up' | 'down' | 'left' | 'right'
}

const StyledThrobber = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 30px;
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
    <motion.div
      layoutId="throbber"
      style={{ position: 'absolute', width: 60, height: 30, ...style }}
    >
      <motion.div animate={{ rotate: getDegrees(point) }}>
        <StyledThrobber />
      </motion.div>
      {/* <motion.div
      animate={{ translateY: [0, 10, 0] }}
      transition={{
        repeatType: 'loop',
        repeat: Infinity,
        duration: 0.25,
      }}
      > */}
      {/* </motion.div> */}
    </motion.div>
  )
}
