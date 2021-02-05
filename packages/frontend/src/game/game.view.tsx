import React, { FC, useRef, useState } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  endTurn,
  GameDispatch,
  GameState,
  playCard,
} from 'game'
import {
  DragDropContext,
  Droppable,
  DropResult,
  SensorAPI,
} from 'react-beautiful-dnd'
import { connect, ConnectedProps } from 'react-redux'
import { Card, DraggableCard, EmptyCard } from '../components'

const _GameView: FC<Props> = ({
  hand,
  stack,
  turnActive,
  uid,
  playCards,
  deal,
  endTurn,
  proceed,
  mode,
}) => {
  const sensorAPIRef = useRef<SensorAPI | null>(null)

  const onDragEnd = (r: DropResult) => {
    console.log(r)
    const card = hand.find((c) => c.card.label === r.draggableId)
    if (
      card &&
      r.destination?.droppableId === 'stack' &&
      r.source.droppableId === 'hand'
    ) {
      playCards([card.card])
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h1>{uid}</h1>
      <div style={{ backgroundColor: 'turquoise', display: 'flex' }}>
        <Droppable droppableId="stack" direction="horizontal">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {stack.length > 0 ? <Card card={stack[0]} /> : <EmptyCard />}
              <span style={{ display: 'none' }}>{provided.placeholder}</span>
            </div>
          )}
        </Droppable>
        {mode === 'replenish' && <button onClick={endTurn}>Replenish</button>}
      </div>
      <div>
        <Droppable droppableId="hand" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                padding: 10,
                display: 'flex',
                backgroundColor: turnActive ? 'yellow' : 'transparent',
              }}
            >
              {hand.map((c, i) => (
                <DraggableCard
                  key={c.card.label}
                  card={c.card}
                  index={i}
                  disabled={!turnActive}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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
  const myCards = state.players.find((p) => p.id === ownProps.uid)?.cards || []
  const mode = state.next ? 'replenish' : 'play'
  return {
    turnActive: state.queue[0] === ownProps.uid,
    mode,
    hand: myCards.filter((c) => c.tier === 2),
    stack: state.stack,
    players: state.players,
  } as const
}

const mapDispatch = (d: GameDispatch) => {
  return {
    playCards: (cards: CardModel[]) => {
      const action = playCard({ cards, playerIndex: 0 })
      d(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(20), factions: [] })
      d(action)
    },
    endTurn: () => {
      const action = endTurn()
      d(action)
    },
    proceed: () => {
      const action = playCard({
        cards: [{ suit: 'D', value: '2', label: '2D' }],
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
