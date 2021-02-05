import { FC } from 'react'
import { RouteComponentProps, useNavigate } from '@reach/router'
import { nanoid } from 'nanoid'

export const EntryPage: FC<RouteComponentProps> = () => {
  const navigate = useNavigate()

  const create = () => {
    const gameID = nanoid(6)
    navigate(`/${gameID}`)
  }

  return <button onClick={create}>Start Game</button>
}
