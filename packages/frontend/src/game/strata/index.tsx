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
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'

import { FluidCard } from '../card'

const _Strata: FC<Props> = ({
  downs,
  ups,
  canCardPlay,
  playCard,
  focusCard,
  isFocused,
  curried,
  mode,
  nudge = 'down',
  active = false,
}) => {
  const getFacedownClickHandler = (card: CardModel) => {
    if (mode === 'play:downs') {
      const ok = canCardPlay(card)
      console.log('revealed!')
      if (ok) {
        return () => playCard(card)
      } else {
        return () => focusCard(card)
      }
    }

    return undefined
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
          display: 'flex',

          position: 'absolute',
          top: 0,
          left: '50%',
          zIndex: 1,
          transform: `translate3d(-50%, ${nudge === 'down' ? 20 : -50}px, 0)`,
          maxWidth: 260,
          marginLeft: -30,
        }}
      >
        {ups.map(({ card }) => {
          const props = curried(card, mode === 'play:ups')

          return <FluidCard key={card.id} {...props} style={{ width: 65 }} />
        })}
      </div>
      <div style={{ display: 'flex' }}>
        {downs.map(({ card }) => (
          <FluidCard
            key={card.id}
            onClick={getFacedownClickHandler(card)}
            card={card}
            variant="default"
            style={{ width: 90 }}
            faceDown={!isFocused(card)}
          />
        ))}
      </div>
    </motion.div>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const myCards =
    state.players.find((p) => p.id === ownProps.ownerID)?.cards || []
  const dest = stackDestinationSelector(state)
  return {
    downs: myCards.filter((c) => c.tier === 0),
    ups: myCards.filter((c) => c.tier === 1),
    canCardPlay: (c: CardModel) => canCardPlay(c, dest),
    isFocused: (c: CardModel) => !!state.focused && state.focused === c.id,
  }
}

const mapDispatch = (dispatch: GameDispatch, own: OwnProps) => {
  return {
    playCard: (c: CardModel) => {
      const action = playCardThunk({ cards: [c], playerID: own.ownerID })
      dispatch(action)
    },
    focusCard: (c: CardModel) => {
      const action = focus(c.id)
      dispatch(action)
    },
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  ownerID: string
  curried: (c: CardModel, a: boolean) => FluidCardProps
  nudge?: 'up' | 'down'
  mode: UserMode
  active?: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const Strata = connector(_Strata)
