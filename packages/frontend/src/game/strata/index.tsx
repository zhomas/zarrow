import { motion } from 'framer-motion'
import {
  canCardPlay,
  CardModel,
  GameDispatch,
  GameState,
  playCardThunk,
  stackDestinationSelector,
  userModeSelector,
  focus,
  UserMode,
  revealThunk,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'

import { FluidCard } from '../card'

const _Strata: FC<Props> = ({
  downs,
  ups,
  revealing,
  canCardPlay,
  playCard,
  revealCard,
  focusCard,
  isFocused,
  curried,
  mode,
  nudge = 'down',
}) => {
  const handleClickDown = (c: CardModel) => {
    console.log('grrr', mode)
    if (mode === 'play:downs') {
      const ok = canCardPlay(c)
      const fn = ok ? playCard : focusCard
      fn(c)
    }

    if (mode === 'play:reveal') {
      revealCard(c)
    }
  }

  const renderDowns = () => {
    if (mode === 'play:reveal') return null
    return (
      <div style={{ display: 'flex' }}>
        {downs.map(({ card }) => (
          <FluidCard
            key={card.id}
            onClick={() => handleClickDown(card)}
            card={card}
            variant="default"
            style={{ width: 90 }}
            faceDown={!isFocused(card)}
          />
        ))}
      </div>
    )
  }

  const renderReveal = () => {
    if (mode !== 'play:reveal') return null
    return (
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: -100,
          right: -140,
          justifyContent: 'space-between',
        }}
      >
        {downs.map(({ card }) => (
          <FluidCard
            key={card.id}
            onClick={() => handleClickDown(card)}
            card={card}
            variant="default"
            style={{ width: 90 }}
            faceDown={!isFocused(card)}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.999, transformOrigin: 'bottom' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          padding: 10,
          position: 'absolute',
          top: 0,
          left: '50%',
          zIndex: 1,
          transform: `translate3d(-50%, ${nudge === 'down' ? 20 : -50}px, 0)`,
          maxWidth: 260,
          marginLeft: -30,
          pointerEvents: revealing ? 'none' : 'all',
        }}
      >
        <motion.div
          style={{ display: 'flex' }}
          initial={{ y: 0 }}
          animate={{ y: mode === 'play:reveal' ? '-100%' : 0 }}
          transition={{ type: 'tween', ease: 'easeInOut' }}
        >
          {ups.map(({ card }) => {
            const props = curried(card, true)

            return <FluidCard key={card.id} {...props} style={{ width: 65 }} />
          })}
        </motion.div>
      </div>
      {renderDowns()}
      {renderReveal()}
    </motion.div>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const myCards =
    state.players.find((p) => p.id === ownProps.ownerID)?.cards || []
  const dest = stackDestinationSelector(state)
  const selector = userModeSelector(ownProps.ownerID)
  const revealing =
    selector(state) === 'play:reveal' && state.queue[0] === ownProps.ownerID
  return {
    mode: selector(state),
    downs: myCards.filter((c) => c.tier === 0),
    ups: myCards.filter((c) => c.tier === 1),
    revealing,
    canCardPlay: (c: CardModel) => canCardPlay(c, dest),
    isFocused: (c: CardModel) => !!state.focused && state.focused === c.id,
  }
}

const mapDispatch = (dispatch: GameDispatch, own: OwnProps) => {
  return {
    playCard: (c: CardModel) => {
      const action = playCardThunk({ cards: [c], playerID: own.uid })
      dispatch(action)
    },
    focusCard: (c: CardModel) => {
      const action = focus(c.id)
      dispatch(action)
    },
    revealCard: (c: CardModel) => {
      const action = revealThunk({ cards: [c], playerID: own.uid })
      dispatch(action)
    },
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  ownerID: string
  uid: string
  curried: (c: CardModel, a: boolean) => FluidCardProps
  nudge?: 'up' | 'down'
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const Strata = connector(_Strata)
