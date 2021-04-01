import { AnimatePresence, motion, Variant } from 'framer-motion'
import { GameState, hasLock } from 'game'
import React, { FC, useEffect, useLayoutEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { styled } from '@linaria/react'
import { time } from 'console'

const wobbleRise: Variant = {
  x: 8,
  y: -100,
  opacity: [1, 0],
  transition: {
    y: {
      duration: 3,
      ease: 'easeOut',
    },
    x: {
      repeat: Infinity,
      duration: 0.3,
      repeatType: 'mirror',
    },
    opacity: {
      duration: 2,
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
`

const SparkleWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 50%;
  width: 200px;
  bottom: 0;
  pointer-events: none;
  color: #fff;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: black;
  transform: translateX(-50%);

  h3 {
    font-size: 28px;
    font-weight: 900;
    text-align: center;
  }
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

  const getRandom = () => {
    const max = 40
    const min = -40
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const [x, setX] = useState(getRandom())
  const [y, setY] = useState(getRandom())

  useEffect(() => {
    setShowEffect(!!effect)
    const timeout = setTimeout(() => {
      setShowEffect(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [effect])

  useLayoutEffect(() => {
    setX(getRandom())
    setY(getRandom())
  }, [showEffect, effect])

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
      case 'psychic':
        return <motion.h3 animate={wobbleRise}>Psychic reveal</motion.h3>
      case 'neutralise':
        return <motion.h3 animate={wobbleRise}>Reset</motion.h3>
      case 'steal':
        return <motion.h3 animate={wobbleRise}>Swap</motion.h3>

      default:
        break
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <StackWrapper>
        {children}
        {burning && <BurnBox animate={burn}>FLAMES</BurnBox>}
      </StackWrapper>
      <SparkleWrapper>
        <motion.div style={{ x: x, y }}> {renderSparkles()}</motion.div>
      </SparkleWrapper>
    </div>
  )
}

const mapState = (state: GameState) => {
  return {
    effect: state.stackEffect,
    show: state.stack.length > 0,
    burning: !!state.burning,
  }
}

const connector = connect(mapState)

interface OwnProps {}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const Sparkler = connector(_Sparkler)
