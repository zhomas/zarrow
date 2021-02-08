import React, { FC } from 'react'
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
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion'

const _GameView: FC<Props> = ({
  hand,
  ups,
  downs,
  stack,
  uid,
  replenishPile,
  playCards,
  deal,
  endTurn,
  proceed,
  mode,
  pickupStack,
}) => {
  const playCard = (c: CardModel) => {
    playCards([c])
  }

  const onHandClick = mode === 'play:hand' ? playCard : () => {}

  const getCardHandler = (c: CardModel, m: Props['mode']) => {
    if (m === mode) {
      return () => playCards([c])
    }

    return () => {}
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
              key={c.label}
              data-card={c.label}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: stack.length - i,
              }}
            >
              <FluidCard key={c.label} card={c} />
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
              key={c.label}
            >
              <FluidCard card={c} faceDown />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div
          style={{
            padding: 10,
            display: 'flex',
            backgroundColor: mode === 'play:hand' ? 'yellow' : 'transparent',
          }}
        >
          {hand.map((c, i) => (
            <FluidCard
              key={c.card.label}
              onClick={getCardHandler(c.card, 'play:hand')}
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
          {ups.map((c, i) => (
            <FluidCard
              key={c.card.label}
              onClick={getCardHandler(c.card, 'play:ups')}
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
      <button
        onClick={() => playCards([{ suit: 'C', value: '5', label: '5C' }])}
      >
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
      const action = deal({ deck: createDeck(3) })
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
        cards: [{ suit: 'D', value: '8', label: '8D' }],
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
