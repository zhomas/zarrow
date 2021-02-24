import {
  CardModel,
  GameState,
  playCardThunk,
  focus,
  GameDispatch,
  revealThunk,
  userModeSelector,
  stackDestinationSelector,
  canCardPlay,
} from 'game'
import { createCardByID } from 'game/dist/deck'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'
import { Tiers } from './index'

const _PlayerTiers: FC<Props> = ({
  ups,
  downs,
  revealing,
  buildPropsFaceUp,
  mode,
  canCardPlay,
  playCard,
  revealCard,
  focusCard,
  focused,
}) => {
  const getFaceDownClickHandler = (c: CardModel) => {
    switch (mode) {
      case 'play:downs':
        const ok = canCardPlay(c)
        const fn = ok ? playCard : focusCard
        fn(c)
        break
      case 'play:reveal':
        revealCard(c)
        break
      default:
    }
  }

  const propsUp = ups.map((c) => buildPropsFaceUp(c))
  const propsDown: FluidCardProps[] = downs.map((c) => {
    return {
      card: c,
      faceDown: c.id !== focused,
      onClick: () => getFaceDownClickHandler(c),
    }
  })

  return (
    <Tiers ups={propsUp} downs={propsDown} revealing={revealing} nudge={'up'} />
  )
}

const mapState = (state: GameState, { uid }: OwnProps) => {
  const cards = state.players.find((p) => p.id === uid)?.cards || []
  const ups = cards.filter((c) => c.tier === 1).map((c) => c.card)
  const downs = cards.filter((c) => c.tier === 0).map((c) => c.card)
  const destination = stackDestinationSelector(state)
  const selector = userModeSelector(uid)

  return {
    ups,
    downs,
    focused: state.focused,
    mode: selector(state),
    canCardPlay: (c: CardModel) => canCardPlay(c, destination),
  }
}

const mapDispatch = (dispatch: GameDispatch, { uid }: OwnProps) => {
  return {
    playCard: (c: CardModel) => {
      const action = playCardThunk({ cards: [c], playerID: uid })
      dispatch(action)
    },
    focusCard: (c: CardModel) => {
      const action = focus(c.id)
      dispatch(action)
    },
    revealCard: (c: CardModel) => {
      const action = revealThunk({
        cards: [c],
        playerID: uid,
      })
      dispatch(action)
    },
  }
}

interface OwnProps {
  uid: string
  revealing: boolean
  buildPropsFaceUp: (c: CardModel) => FluidCardProps
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const PlayerTiers = connector(_PlayerTiers)
