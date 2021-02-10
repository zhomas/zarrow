import React, { FC, useCallback, useEffect, useState } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  confirmReplenish,
  confirmTargeting,
  GameDispatch,
  GameState,
  playCardThunk,
  stackDestinationSelector,
  canCardPlay,
  userModeSelector,
  pickupStack,
  activeTierSelector,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCard, EmptyCard } from '../components'
import { FaceDowns } from './downs'
import { AnimateSharedLayout } from 'framer-motion'
import { getCardProps, useGameViewModel } from './game.view.model'
import { Reticule } from './reticule'
import { FluidCardProps } from '../typings'
import { createCardByID } from 'game/dist/deck'

const _GameView: FC<Props> = ({
  hand,
  ups,
  stack,
  uid,
  replenishPile,
  playCards,
  deal,
  confirmReplenish: endTurn,
  mode,
  pickupStack,
  canPlay,
  destination,
  activeCards,
}) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<CardModel[]>([])
  const [faceUpPickupRule, setFaceUpRule] = useState<boolean>()

  useEffect(() => {
    setSelected([])
    setHovered([])
  }, [mode, stack.length])

  useEffect(() => {
    setHovered([])
  }, [selected])

  const curried = (c: CardModel, isActiveMode: boolean) => {
    return getCardProps({
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
    })
  }

  return (
    <AnimateSharedLayout>
      {faceUpPickupRule && (
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
                  const cards = activeCards
                    .map((c) => c.card)
                    .filter((b) => b.value === c.card.value)

                  setFaceUpRule(false)
                  pickupStack(...cards)
                }}
              />
            ))}
          </div>
        </div>
      )}
      <h1>
        {uid} :: {mode}
      </h1>
      <div style={{ backgroundColor: 'turquoise', display: 'flex' }}>
        <div style={{ position: 'relative' }}>
          {stack.map((c, i) => (
            <div
              key={c.id}
              data-card={c.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: stack.length - i,
              }}
            >
              <FluidCard key={c.id} card={c} variant="default" />
            </div>
          ))}
          <div style={{ position: 'relative', zIndex: -1 }}>
            <EmptyCard />
          </div>
        </div>
        {mode === 'pickup:stack' && (
          <button
            onClick={() => {
              if (activeCards.some((c) => c.tier === 1)) {
                setFaceUpRule(true)
              } else {
                pickupStack()
              }
            }}
          >
            Pick up stack
          </button>
        )}
        <button disabled={mode !== 'pickup:replenish'} onClick={endTurn}>
          Replenish ({replenishPile.length} cards remaining)
        </button>
        <div style={{ width: 200, height: 200, position: 'relative' }}>
          {replenishPile.map((c, i) => (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: -i,
              }}
              key={c.id}
            >
              <FluidCard card={c} faceDown variant="default" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div>
          <button
            disabled={selected.length === 0}
            onClick={() => {
              playCards(...selected)
            }}
          >
            Play selected
          </button>
        </div>
        <div
          style={{
            padding: 10,
            display: 'flex',
            backgroundColor: mode === 'play:hand' ? 'yellow' : 'transparent',
          }}
        >
          {hand.map((c) => {
            const props = curried(c.card, mode === 'play:hand')
            return (
              <FluidCard
                key={c.card.id}
                {...props}
                selected={selected.some((s) => s.id === c.card.id)}
              />
            )
          })}
        </div>
      </div>
      <div>
        <div
          style={{
            padding: 10,
            display: 'flex',
            backgroundColor: mode === 'play:ups' ? 'thistle' : 'transparent',
          }}
        >
          {ups.map((c) => {
            const props = curried(c.card, mode === 'play:ups')

            return (
              <FluidCard
                key={c.card.id}
                {...props}
                selected={selected.some((s) => s.id === c.card.id)}
              />
            )
          })}
        </div>
      </div>
      <div>
        <FaceDowns uid={uid} />
      </div>
      <button onClick={deal}>Re-deal</button>
      <Reticule uid={uid} />
    </AnimateSharedLayout>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const destination = stackDestinationSelector(state)
  const myCards = state.players.find((p) => p.id === ownProps.uid)?.cards || []
  const getMode = userModeSelector(ownProps.uid)
  const canPlay = (c: CardModel) => {
    return canCardPlay(c, destination)
  }

  return {
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
  } as const
}

const mapDispatch = (d: GameDispatch) => {
  return {
    playCards: (...cards: CardModel[]) => {
      const action = playCardThunk({ cards })
      d(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(34) })
      d(action)
    },
    confirmReplenish: () => {
      const action = confirmReplenish()
      d(action)
    },
    pickupStack: (...additions: CardModel[]) => {
      const action = pickupStack([...additions])
      d(action)
    },
  }
}

type OwnProps = { uid: string }
type Props = OwnProps & PropsFromRedux

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export const GameView = connector(_GameView)
