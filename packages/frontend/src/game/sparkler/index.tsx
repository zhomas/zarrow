import { AnimatePresence, motion, Variant } from 'framer-motion'
import { GameState, hasLock } from 'game'
import React, { FC, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { styled } from '@linaria/react'
import { time } from 'console'

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

const _Sparkler: FC<Props> = ({ show, children, burning, effect }) => {
  const [showEffect, setShowEffect] = useState(false)

  useEffect(() => {
    setShowEffect(!!effect)
    const timeout = setTimeout(() => {
      setShowEffect(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [effect])

  const renderSparkles = () => {
    if (!showEffect) return null

    switch (effect) {
      case 'ww7':
        return (
          <motion.h3 animate={wobbleRise}>Weird whacky sevens time</motion.h3>
        )
      case 'glide':
        return <motion.h3 animate={wobbleRise}>Glide on by</motion.h3>
      case 'skip':
        return <motion.h3 animate={wobbleRise}>Skip a go</motion.h3>
      case 'dw7':
        return <motion.h3 animate={wobbleRise}>Double whacky sevens</motion.h3>
      default:
        break
    }
  }

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
        {renderSparkles()}
      </motion.div>
    </div>
  )
}

const isBurning = hasLock('burn')

const mapState = (state: GameState) => {
  const sparkles = [...state.turnClocks]

  return {
    sparkles,
    effect: state.stackEffect,
    show: state.stack.length > 0,
    burning: isBurning(state),
    weirdWackySevensTime: state.turnClocks.some((c) => c === 'ww7'),
  }
}

const connector = connect(mapState)

interface OwnProps {}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const Sparkler = connector(_Sparkler)
