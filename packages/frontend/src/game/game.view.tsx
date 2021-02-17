import React, { FC } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  unlockTurn,
  GameDispatch,
  GameState,
  playCardThunk,
  pickupThunk,
  highlightedLocationSelector,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCard } from './card'

import { AnimateSharedLayout } from 'framer-motion'
import { useCardBuilder as useLocalCardContext } from './game.hooks'
import { Zone } from './zone'
import { Miniplayer } from './miniplayer'
import { FUPU } from './fupu'
import { EnemyHand } from './hand/enemy'

import { PlayerHand } from './hand/player'

import { styled } from '@linaria/react'
import { Reticule } from './reticule'

const GameWrapper = styled.main`
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 40px;
  grid-template-rows: 40px 1fr 1fr 1fr 120px;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  background: #333333;
  height: 100vh;
  overflow: hidden;

  > div {
    position: relative;
    z-index: 1;
  }

  .h1 {
    grid-area: 5 / 2 / 6 / 5;
    z-index: 2;
  }
  .h2 {
    grid-area: 1 / 3 / 2 / 4;
  }
  .s1 {
    grid-area: 4 / 3 / 5 / 4;
    display: flex;
    flex-direction: column-reverse;
  }
  .s2 {
    grid-area: 2 / 3 / 3 / 4;
  }
  .table {
    grid-area: 2 / 2 / 5 / 5;
    background: #2b7f2b;
    z-index: 0;
  }
  .table-main {
    grid-area: 3 / 3 / 4 / 4;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .br {
    grid-area: 4 / 4 / 5 / 5;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

const _GameView: FC<Props> = ({
  stack,
  uid,
  replenishPile,
  deal,
  players,
  confirmReplenish,
  pickupStack,
  highlight,
}) => {
  const { buildHandCard, buildForPlayerStrata, buildNPC } = useLocalCardContext(
    uid,
  )

  const opponent = players.find((p) => p.id !== uid)
  if (!opponent) throw new Error('Oh no')

  return (
    <AnimateSharedLayout type="switch">
      <GameWrapper>
        <div className="h1">
          <PlayerHand ownerID={uid} curried={buildHandCard} />
        </div>
        <div className="h2">
          <EnemyHand ownerID={opponent.id} />
        </div>
        <div className="s2">
          <Miniplayer ownerID={opponent.id} curried={buildNPC} uid={uid} />
        </div>
        <div className="s1">
          <Miniplayer
            ownerID={uid}
            curried={buildForPlayerStrata}
            nudge="up"
            uid={uid}
          />
        </div>
        <div className="table"></div>
        <div className="table-main">
          <Zone
            onPrompt={pickupStack}
            promptActive={highlight === 'stack'}
            cards={stack.map((c) => (
              <FluidCard key={c.id} card={c} />
            ))}
          />
        </div>
        <div className="br">
          <Zone
            onPrompt={confirmReplenish}
            promptActive={highlight === 'replenish'}
            cards={replenishPile.map((c) => (
              <FluidCard key={c.id} card={c} faceDown />
            ))}
          />
        </div>
        <Reticule uid={uid} />
        <FUPU uid={uid} />
      </GameWrapper>
      <button onClick={deal}>Redeal</button>
    </AnimateSharedLayout>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const getHighlight = highlightedLocationSelector(ownProps.uid)
  return {
    stack: state.stack,
    players: state.players,
    replenishPile: state.pickupPile,
    highlight: getHighlight(state),
  } as const
}

const mapDispatch = (d: GameDispatch, ownProps: OwnProps) => {
  return {
    playCards: (...cards: CardModel[]) => {
      const action = playCardThunk({ cards, playerID: ownProps.uid })
      d(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(25) })
      d(action)
    },
    confirmReplenish: () => {
      const action = unlockTurn({ channel: 'user:replenish' })
      d(action)
    },
    confirmPickupFaceUp: (c: CardModel) => {
      const action = unlockTurn({ channel: 'user:faceuptake', data: c.id })
      d(action)
    },
    pickupStack: () => {
      const action = pickupThunk()
      d(action)
    },
  }
}

type OwnProps = { uid: string }
type Props = OwnProps & PropsFromRedux

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export const GameView = connector(_GameView)
