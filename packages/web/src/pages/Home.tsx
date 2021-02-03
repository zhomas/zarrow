import { RouteComponentProps, useNavigate } from '@reach/router'
import React, { FC } from 'react'
import firebase from 'firebase'

export const Home: FC<RouteComponentProps> = (props) => {
  const navigate = useNavigate()

  const startGame = async () => {
    const fn = firebase.functions().httpsCallable('create')
    const result = await fn({ hostID: 'abc' })
    const gameID = result.data.id
    navigate(`/game/${gameID}`)
  }

  return <button onClick={startGame}>New game</button>
}
