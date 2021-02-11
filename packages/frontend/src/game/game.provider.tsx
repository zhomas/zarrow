import { GameState, getStore } from 'game'
import React, { FC, useMemo } from 'react'
import { Provider } from 'react-redux'
import firebase from 'firebase'

interface ProviderProps {
  initialState: GameState
  gid: string
}

export const GameProvider: FC<ProviderProps> = ({
  initialState,
  gid,
  children,
}) => {
  const store = useMemo(() => {
    return getStore(initialState, (api) => (next) => (action) => {
      const result = next(action)
      if (action.type !== 'counter/replace') {
        console.log('dispatch', action)
        console.log('Next state', api.getState())

        const { local, ...state }: GameState = api.getState()
        const data: GameState = {
          ...state,
          focused: state.focused || '',
        }

        firebase.firestore().collection('games').doc(gid).set(data)
      }

      return result
    })
  }, [initialState, gid])

  return <Provider store={store}>{children}</Provider>
}
