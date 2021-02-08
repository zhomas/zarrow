import React, { FC, useState } from 'react'
import { CardModel, createDeck } from 'game'
import ReactDOM from 'react-dom'
import { RouteComponentProps } from '@reach/router'
import { motion, AnimateSharedLayout } from 'framer-motion'
import { FluidCard } from './components'

const CardWrapper: FC<{ card: CardModel }> = ({ card }) => {
  return (
    <motion.div layoutId={card.label}>
      <span>{card.label}</span>
    </motion.div>
  )
}

const deck = createDeck()

export const Test: FC<RouteComponentProps> = () => {
  const [down, setDown] = useState(false)

  return (
    <>
      <FluidCard
        card={{ suit: 'S', value: 'A', label: 'AS' }}
        faceDown={down}
      />
      <button onClick={() => setDown((d) => !d)}>Flip</button>
    </>
  )
}
