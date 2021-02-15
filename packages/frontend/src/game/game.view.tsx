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

import { styled } from '@linaria/react'
import { Throbber } from './throbber'

const ZoneLabel = styled.div`
  width: 100px;
  display: flex;
  align-items: flex-end;
  text-align: right;
  padding: 10px;
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

  return (
    <AnimateSharedLayout>
      {pickFaceUp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            color: 'white',
            padding: '10vh',
          }}
        >
          <h1>Pick a card to pickup:</h1>
          <div>
            {activeCards.map((c) => (
              <FluidCard
                key={c.card.id}
                keyPrefix={'fup'}
                card={c.card}
                onClick={() => {
                  confirmPickupFaceUp(c.card)
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'space-between',
          backgroundColor: '#2b6c35',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Miniplayer
            ownerID={opponent.id}
            curried={curried}
            showActivityWidget={
              typeof highlight === 'object' && highlight[1] === opponent.id
            }
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ZoneLabel>
            <h4>{stack.length} cards in stack</h4>
          </ZoneLabel>
          <Zone
            promptLabel={'Pick up stack'}
            promptActive={mode === 'pickup:stack'}
            onPrompt={pickupStack}
          >
            {stack.map((c, i) => (
              <FluidCard
                key={c.id}
                stackIndex={i}
                stackLength={stack.length}
                card={c}
                variant="default"
              />
            ))}
          </Zone>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: 120,
          }}
        >
          <Miniplayer
            ownerID={uid}
            curried={curried}
            nudge="up"
            fadedStrata={cardsInHand && activePlayerID === uid}
            showActivityWidget={highlightedPlayer === uid}
          />
        </div>
        <Hand
          cardsLength={hand.length}
          active={mode === 'play:hand'}
          playSelected={() => playCards(...selected)}
          playSelectedDisabled={selected.length === 0}
          mode={mode}
        >
          {highlight === 'hand' && <Throbber point="right" />}
          {hand.map((c) => {
            const props = curried(
              c.card,
              mode === 'play:hand' && activePlayerID === uid,
            )
            return (
              <FluidCard
                key={c.card.id}
                {...props}
                selected={selected.some((s) => s.id === c.card.id)}
              />
            )
          })}
        </Hand>
      </div>
      <Reticule uid={uid} />
      <button
        style={{ position: 'absolute', top: 10, right: 10 }}
        onClick={deal}
      >
        Re-deal
      </button>
      <div style={{ position: 'absolute', right: 20, top: '50%' }}>
        <Zone
          promptLabel={'Replenish'}
          promptActive={mode === 'pickup:replenish'}
          onPrompt={confirmReplenish}
        >
          {replenishPile.map((c) => (
            <FluidCard key={c.id} card={c} faceDown variant="default" />
          ))}
        </Zone>
        <ZoneLabel style={{ textAlign: 'left' }}>
          <h4>{replenishPile.length} cards left</h4>
        </ZoneLabel>
      </div>
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

  const getHilite = () => {
    const mode = getMode(state)
    if (mode === 'play:hand') {
      return 'strata'
    }
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
