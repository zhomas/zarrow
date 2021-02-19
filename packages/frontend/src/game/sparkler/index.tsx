import { AnimatePresence, motion, useAnimation, Variant } from 'framer-motion'
import { GameState, hasLock } from 'game'
import { nanoid } from 'nanoid'
import React, { FC, useState } from 'react'
import { useLayoutEffect } from 'react'
import { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { styled } from '@linaria/react'

const wobbleRise: Variant = {
  x: 10,
  y: -100,
  opacity: [1, 0],
  transition: {
    y: {
      duration: 1,
      ease: 'easeOut',
    },
    x: {
      repeat: Infinity,
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.3,
      repeatType: 'mirror',
    },
    opacity: {
      duration: 1,
    },
  },
}

const burn: Variant = {
  opacity: 0,
  transition: {
    duration: 0.25,
    delay: 1.5,
  },
}

const StackWrapper = styled(motion.div)`
  width: 146px;
  height: 196px;
  background: #000;
`

const BurnBox = styled(motion.div)`
  background: red;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const _Sparkler: FC<Props> = ({
  happening,
  count,
  show,
  children,
  burning,
}) => {
  return (
    <div style={{ position: 'relative' }}>
      <StackWrapper>
        <AnimatePresence>
          {show && <motion.div exit={{ opacity: 0 }}>{children}</motion.div>}
        </AnimatePresence>
        {burning && <BurnBox animate={burn}>FLAMES</BurnBox>}
      </StackWrapper>
      <motion.div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          left: '100%',
          top: 0,
          width: 50,
          height: 50,
        }}
      >
        {burning && <motion.h3 animate={wobbleRise}>Burn!</motion.h3>}
      </motion.div>
    </div>
  )
}

const isBurning = hasLock('burn')

const mapState = (state: GameState) => ({
  show: state.stack.length > 0,
  burning: isBurning(state),
  count: state.happenings ? state.happenings.length : 0,
  happening:
    state.happenings && state.happenings.length
      ? state.happenings[state.happenings.length - 1].type
      : '',
})

const connector = connect(mapState)

interface OwnProps {}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const Sparkler = connector(_Sparkler)
