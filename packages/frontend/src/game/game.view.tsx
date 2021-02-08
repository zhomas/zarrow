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
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { connect, ConnectedProps } from 'react-redux'
import { Card, DraggableCard, EmptyCard } from '../components'
import { FaceDowns } from './downs'

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
  const onDragEnd = (r: DropResult) => {
    console.log(r)
    const card = [...hand, ...downs, ...ups].find(
      (c) => c.card.label === r.draggableId,
    )
    if (
      card &&
      r.destination?.droppableId === 'stack' &&
      ['hand', 'ups', 'downs'].includes(r.source.droppableId)
    ) {
      console.log(r)
      playCards([card.card])
      console.log('playing card : ', card.card)
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h1>
        {uid} :: {mode}
      </h1>
      <div style={{ backgroundColor: 'turquoise', display: 'flex' }}>
        <Droppable droppableId="stack" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {stack.length > 0 ? <Card card={stack[0]} /> : <EmptyCard />}
              <span style={{ display: 'none' }}>{provided.placeholder}</span>
            </div>
          )}
        </Droppable>
        {mode === 'pickupStack' && (
          <button onClick={pickupStack}>Pick up stack</button>
        )}
        <button disabled={mode !== 'replenish'} onClick={endTurn}>
          Replenish ({replenishPile.length} cards remaining)
        </button>
      </div>
      <div>
        <Droppable droppableId="hand" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                padding: 10,
                display: 'flex',
                backgroundColor:
                  mode === 'play:hand' ? 'yellow' : 'transparent',
              }}
            >
              {hand.map((c, i) => (
                <DraggableCard
                  key={c.card.label}
                  card={c.card}
                  index={i}
                  disabled={mode !== 'play:hand'}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <div>
        <Droppable droppableId="ups" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                padding: 10,
                display: 'flex',
                backgroundColor:
                  mode === 'play:ups' ? 'thistle' : 'transparent',
              }}
            >
              {ups.map((c, i) => (
                <DraggableCard
                  key={c.card.label}
                  card={c.card}
                  index={i}
                  disabled={mode !== 'play:ups'}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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
    </DragDropContext>
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
      const action = playCard({ cards, playerIndex: 0 })
      d(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(10), factions: [] })
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
        playerIndex: 0,
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
