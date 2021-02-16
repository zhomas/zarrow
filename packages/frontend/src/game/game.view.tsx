import React, { FC, useCallback, useEffect, useState } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  unlockTurn,
  GameDispatch,
  GameState,
  playCardThunk,
  stackDestinationSelector,
  canCardPlay,
  userModeSelector,
  pickupThunk,
  activeTierSelector,
  highlightedLocationSelector,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCard } from './card'

import { AnimateSharedLayout, motion } from 'framer-motion'
import { getCardProps } from './game.view.model'
import { Reticule } from './reticule'
import { Zone } from './zone'
import { Miniplayer } from './miniplayer'
import { Hand } from './hand'
import { Strata } from './strata'
import { EnemyHand } from './hand/enemy'
import { Stack } from './stack'
import { ReplenishPile } from './replenish'

import { PlayerHand } from './hand/player'

import { styled } from '@linaria/react'
import { Throbber } from './throbber'

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
  hand,
  ups,
  stack,
  uid,
  replenishPile,
  playCards,
  deal,
  players,
  confirmReplenish,
  confirmPickupFaceUp,
  mode,
  pickupStack,
  destination,
  activeCards,
  pickFaceUp,
  activePlayerID,
  highlight,
}) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<CardModel[]>([])

  useEffect(() => {
    setSelected([])
    setHovered([])
  }, [mode, stack.length])

  useEffect(() => {
    setHovered([])
  }, [selected])

  const curried = useCallback(
    (c: CardModel, isActiveMode: boolean) =>
      getCardProps({
        active: isActiveMode,
        destID: destination.id,
        selected: selected.map((c) => c.id),
        hovered: hovered.map((h) => h.id),
        id: c.id,
        toggleHover: () => {
          const next = hovered.includes(c)
            ? hovered.filter((h) => h.id !== c.id)
            : [...hovered, c]

          setHovered(next)
        },
        toggleSelected: () => {
          const next = selected.includes(c)
            ? selected.filter((h) => h.id !== c.id)
            : [...selected, c]

          console.log('toggle selected!', next)
          setSelected(next)
        },
        playAllSiblings: () => {
          const siblings = activeCards
            .filter((a) => a.card.value === c.value)
            .map((a) => a.card)

          playCards(...siblings)
        },
        hand: activeCards.map((a) => a.card),
      }),
    [activeCards, destination.id, hovered, playCards, selected],
  )

  const opponent = players.find((p) => p.id !== uid)
  if (!opponent) throw new Error('Oh no')

  const cardsInHand = activeCards.filter((c) => c.tier === 2).length > 0
  const highlightedPlayer = highlight[1]
  const showX = mode === 'play:ups'

  const playerHandCards = hand.map((c) => (
    <FluidCard key={c.card.id} card={c.card} />
  ))
  const stackCards = stack.map((c) => <FluidCard key={c.id} card={c} />)
  const replenishCards = replenishPile.map((c) => (
    <FluidCard key={c.id} card={c} faceDown />
  ))

  return (
    <AnimateSharedLayout type="switch">
      <GameWrapper>
        <div className="h1">
          <PlayerHand ownerID={uid} curried={curried} />
        </div>
        <div className="h2">
          <EnemyHand ownerID={opponent.id} />
        </div>
        <div className="s2">
          <Miniplayer ownerID={opponent.id} curried={curried} />
        </div>
        <div className="s1">
          <Miniplayer ownerID={uid} curried={curried} nudge="up" />
        </div>
        <div className="table"></div>
        <div className="table-main"></div>
        <div className="br">
          {/* {stack.map((c) => {
            return <FluidCard key={c.id} card={c} />
          })} */}
          <Zone
            onPrompt={pickupStack}
            cards={stackCards}
            promptLabel=""
            promptActive={true}
          />
          <Zone
            onPrompt={confirmReplenish}
            cards={replenishCards}
            promptLabel=""
            promptActive={true}
          />
        </div>
      </GameWrapper>
      <button onClick={deal}>Redeal</button>
    </AnimateSharedLayout>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const destination = stackDestinationSelector(state)
  const myCards = state.players.find((p) => p.id === ownProps.uid)?.cards || []
  const getMode = userModeSelector(ownProps.uid)
  const getHighlight = highlightedLocationSelector(ownProps.uid)
  const canPlay = (c: CardModel) => {
    return canCardPlay(c, destination)
  }

  return {
    pickFaceUp: state.turnLocks?.some((c) => c === 'user:faceuptake'),
    turnActive: state.queue[0] === ownProps.uid,
    mode: getMode(state),
    hand: myCards.filter((c) => c.tier === 2),
    ups: myCards.filter((c) => c.tier === 1),
    downs: myCards.filter((c) => c.tier === 0),
    stack: state.stack,
    players: state.players,
    replenishPile: state.pickupPile,
    myCards,
    canPlay,
    activeCards: activeTierSelector(state),
    destination,
    burn: state.burnt,
    activePlayerID: state.queue[0],
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
      const action = deal({ deck: createDeck(32) })
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
