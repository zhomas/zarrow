import React, { FC, useEffect, useState } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  endTurn,
  GameDispatch,
  GameState,
  playCard,
  stackDestinationSelector,
  canCardPlay,
  userModeSelector,
  pickupStack,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCard, EmptyCard } from '../components'
import { FaceDowns } from './downs'
import { AnimateSharedLayout } from 'framer-motion'

const useFluidCardHandlers = (currentMode: string) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<CardModel[]>([])

  return {
    getCardProps: (c: CardModel, m: string) => {
      if (m !== currentMode) {
        return {
          uiState: 'default',
          onClick: undefined,
          onRightClick: undefined,
          onMouseEnter: undefined,
          onMouseExit: undefined,
        }
      }
    },
  }
}

const _GameView: FC<Props> = ({
  hand,
  ups,
  stack,
  uid,
  replenishPile,
  playCards,
  deal,
  endTurn,
  proceed,
  mode,
  pickupStack,
  canPlay,
}) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<CardModel[]>([])

  useEffect(() => {
    setSelected([])
  }, [mode])

  const onMouseOver = (c: CardModel) => {
    return () => setHovered([...hovered, c])
  }

  const onMouseExit = (c: CardModel) => {
    return () => setHovered(hovered.filter((h) => h.id !== c.id))
  }

  const selectAll = (c: CardModel, m: Props['mode']) => {
    if (m === mode) {
      return () => playCards([c])
    }

    return undefined
  }

  const selectMulti = (c: CardModel, m: Props['mode']) => {
    if (m === mode && canPlay(c)) {
      if (selected.includes(c)) {
        return () => setSelected((sel) => sel.filter((se) => se.id !== c.id))
      }

      if (selected.length === 0) {
        return () => {
          setSelected([c])
        }
      }

      if (selected.findIndex((sel) => sel.value === c.value) > -1) {
        return () => {
          const next = [...selected, c]
          setSelected(next)
        }
      }
    }
    return undefined
  }

  const stateGetter = (c: CardModel, m: Props['mode']) => {
    if (mode === m) {
      if (!canPlay(c)) {
        return 'greyed'
      }

      if (hovered.length === 1) {
        if (hovered[0].id === c.id) return 'highlight'
        if (c.value === hovered[0].value) return 'lowlight'
      }

      if (selected.includes(c)) {
        return 'lowlight'
      }

      if (hovered.includes(c)) {
        return 'highlight'
      }
    }
    return 'default'
  }

  return (
    <AnimateSharedLayout>
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
              <FluidCard key={c.id} card={c} />
            </div>
          ))}
          <div style={{ position: 'relative', zIndex: -1 }}>
            <EmptyCard />
          </div>
        </div>
        {mode === 'pickup:stack' && (
          <button onClick={pickupStack}>Pick up stack</button>
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
              <FluidCard card={c} faceDown />
            </div>
          ))}
        </div>
      </div>
      <div>
        <button
          disabled={!selected.length}
          onClick={() => {
            playCards(selected)
          }}
        >
          Play em
        </button>

        <div
          style={{
            padding: 10,
            display: 'flex',
            backgroundColor: mode === 'play:hand' ? 'yellow' : 'transparent',
          }}
        >
          {hand.map((c) => (
            <FluidCard
              key={c.card.id}
              onClick={selectMulti(c.card, 'play:hand')}
              onRightClick={selectAll(c.card, 'play:hand')}
              onMouseEnter={onMouseOver(c.card)}
              onMouseExit={onMouseExit(c.card)}
              multiSelected={selected.includes(c.card)}
              uiState={stateGetter(c.card, 'play:hand')}
              card={c.card}
              disabled={mode !== 'play:hand'}
            />
          ))}
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
          {ups.map((c) => (
            <FluidCard
              key={c.card.id}
              onClick={selectAll(c.card, 'play:ups')}
              card={c.card}
              disabled={mode !== 'play:ups'}
            />
          ))}
        </div>
      </div>
      <div>
        <FaceDowns uid={uid} />
      </div>
      <button onClick={deal}>Re-deal</button>
      <button onClick={() => playCards([{ suit: 'C', value: '5', id: '5C' }])}>
        Test
      </button>

      <div>
        <button onClick={proceed}>Next!</button>
      </div>
    </AnimateSharedLayout>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  console.log(state)

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
  } as const
}

const mapDispatch = (d: GameDispatch) => {
  return {
    playCards: (cards: CardModel[]) => {
      const action = playCard({ cards })
      d(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(34) })
      d(action)
    },
    endTurn: () => {
      const action = endTurn()
      d(action)
    },
    pickupStack: () => {
      const action = pickupStack([])
      d(action)
    },
    proceed: () => {
      const action = playCard({
        cards: [{ suit: 'D', value: '8', id: '8D' }],
      })

      d(action)
      d(endTurn())
    },
  }
}

type OwnProps = { uid: string }
type Props = OwnProps & PropsFromRedux

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export const GameView = connector(_GameView)
