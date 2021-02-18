import { motion, useAnimation, Variant, Variants } from 'framer-motion'
import { GameState } from 'game'
import { nanoid } from 'nanoid'
import React, { FC, useState } from 'react'
import { useLayoutEffect } from 'react'
import { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'

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

const _Sparkler: FC<Props> = ({ happening, count, children }) => {
  const firstUpdate = useRef(true)
  const animation = useAnimation()
  const [hap, setHap] = useState('')
  const [k, setK] = useState('')

  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    setTimeout(() => {
      setHap(happening)
      setK(nanoid())
      animation.start(wobbleRise)
    }, 400)
  }, [happening, count, animation])

  const renderContent = () => {
    if (firstUpdate.current) return null
    switch (hap) {
      case 'burn':
        return <h3>Burn!</h3>
      default:
        return null
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <motion.div
        key={k}
        animate={animation}
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          left: '100%',
          top: 0,
          width: 50,
          height: 50,
        }}
      >
        {renderContent()}
      </motion.div>
    </div>
  )
}

const mapState = (state: GameState) => ({
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
