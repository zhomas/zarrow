import { GameState, getStore } from 'game'
import { FC, useMemo } from 'react'
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
      console.log('dispatch', action)
      if (action.type !== 'counter/replace') {
        console.log('Next state', api.getState())
        firebase.firestore().collection('games').doc(gid).set(api.getState())
      }

      return result
    })
  }, [initialState, gid])

  return <Provider store={store}>{children}</Provider>
}