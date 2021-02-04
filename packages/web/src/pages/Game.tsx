import React, { FC } from 'react'
import { RouteComponentProps } from '@reach/router'

import { useGame } from '../api/useGame'
import { useGameDispatch } from '../api/useGameDispatch'
import { Lobby } from '../features/Lobby'
import { Zarrow } from '../features/Zarrow'

interface RouteParams {
  gameID: string
}

interface OtherProps {
  userID: string
}

type Props = RouteComponentProps<RouteParams> & OtherProps

export const Game: FC<Props> = ({ gameID, userID }) => {
  const game = useGame(gameID)
  const dispatch = useGameDispatch(gameID, userID)

  if (gameID && userID) {
    switch (game.mode) {
      case 'lobby':
      case 'lobby:valid':
        return <Lobby gid={gameID} uid={userID} state={game} />
      case 'running':
        return <Zarrow state={game} uid={userID} emit={dispatch} />
    }
  }
  return (
    <>
      <h1>Hmmm</h1>
    </>
  )
}
