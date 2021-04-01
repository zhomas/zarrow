import React from 'react'
import { GameDispatch, GameState, replace, userModeSelector } from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { pickUpOnEmpty } from './states/index'

const states = {
  pickUpOnEmpty,
}

const _Debugger = (props: Props) => {
  return (
    <select
      onChange={(e) => {
        console.log(e.target.value)

        if (e.target.value in states) {
          props.simulateGame(e.target.value as any)
        }
      }}
    >
      <option></option>
      {Object.keys(states).map((st) => {
        return <option>{st}</option>
      })}
    </select>
  )
}

const mapState = (state: GameState, o: OwnProps) => {
  const modeSelector = userModeSelector(o.uid)
  console.group('Debugger')
  const mode = modeSelector(state)
  console.log('Mode', mode)
  console.log(state)
  console.groupEnd()

  return {}
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    simulateGame: (key: keyof typeof states) => {
      const action = replace(states[key])
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
