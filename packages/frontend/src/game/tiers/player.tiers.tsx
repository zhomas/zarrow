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
  highlightedLocationSelector,
  activeFupuSelector,
} from 'game'
import React, { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'
import { FUPU } from '../fupu'
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
  throb,
  uid,
  fupu,
}) => {
  useEffect(() => {
    document.addEventListener('click', (e) => {
      console.log(e.target)
    })
  }, [])

  const getFaceDownClickHandler = (c: CardModel) => {
    switch (mode) {
      case 'play:downs':
        const ok = canCardPlay(c)
        const fn = ok ? playCard : focusCard
        return () => fn(c)
      case 'play:reveal':
        return () => revealCard(c)
      default:
        return undefined
    }
  }

  const propsUp = fupu ? [] : ups.map((c) => buildPropsFaceUp(c))
  const propsDown: FluidCardProps[] = downs.map((c) => {
    return {
      card: c,
      faceDown: c.id !== focused,
      onClick: getFaceDownClickHandler(c),
    }
  })

  const fupuUps = fupu ? ups : []

  return (
    <div style={{ textAlign: 'center' }}>
      <Tiers
        ups={propsUp}
        downs={propsDown}
        revealing={revealing}
        nudge={'up'}
        throb={throb}
      />
      <FUPU cards={fupuUps} uid={uid} />
    </div>
  )
}

const mapState = (
  state: GameState,
  { uid, revealing, ups, downs }: OwnProps,
) => {
  const destination = stackDestinationSelector(state)
  const selector = userModeSelector(uid)
  const highlight = highlightedLocationSelector(uid)(state)

  return {
    ups,
    downs,
    focused: state.focused,
    mode: selector(state),
    throb: !revealing && highlight[1] === uid,
    fupu: activeFupuSelector(state) === uid,
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
  ups: CardModel[]
  downs: CardModel[]
  buildPropsFaceUp: (c: CardModel) => FluidCardProps
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const PlayerTiers = connector(_PlayerTiers)
