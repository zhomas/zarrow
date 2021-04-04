import React, { useState } from 'react'
import { GameDispatch, GameState, replace, userModeSelector } from 'game'
import { connect, ConnectedProps } from 'react-redux'
import * as states from './states/index'
import { SIGALRM } from 'node:constants'

type StateKey = keyof typeof states

const _Debugger = (props: Props) => {
  const [selected, select] = useState<StateKey>('pickUpOnEmpty')

  return (
    <>
      <select
        onChange={(e) => {
          const v = e.target.value
          if (v in states) {
            select(v as StateKey)
          }
        }}
      >
        {Object.keys(states).map((st) => {
          return <option>{st}</option>
        })}
      </select>
      <button onClick={() => props.simulateGame(selected, props.state)}>
        Emit
      </button>
    </>
  )
}

const mapState = (state: GameState, o: OwnProps) => {
  const modeSelector = userModeSelector(o.uid)
  console.group('Debugger')
  const mode = modeSelector(state)
  console.log('Mode', mode)
  console.log(state)
  console.groupEnd()

  return { state }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    simulateGame: (key: StateKey, state: GameState) => {
      const sim = states[key]
      const q = sim.queue.map((id) => {
        const idx = sim.players.findIndex((pl) => pl.id === id)
        return state.players[idx].id
      })
      const st: GameState = {
        ...sim,
        queue: q,
        players: state.players.map((pl, i) => {
          return {
            ...pl,
            cards: [...sim.players[i].cards],
          }
        }),
      }
      const action = replace(st)
      dispatch(action)
    },
  }
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>
type OwnProps = {
  uid: string
}

type Props = ReduxProps & OwnProps

export const Debugger = connector(_Debugger)
