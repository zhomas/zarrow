import { styled } from '@linaria/react'
import { motion } from 'framer-motion'
import {
  canCardPlay,
  CardModel,
  GameState,
  playCardThunk,
  stackDestinationSelector,
  focus,
  GameDispatch,
  userModeSelector,
  unlockTurn,
  highlightedLocationSelector,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'
import { FluidCard } from '../card'
import { Throbber } from '../throbber'
import { Zone } from '../zone'

const Wrapper = styled.div`
  position: relative;
`

const _Stack: FC<Props> = ({ list, pickupNow, confirmReplenish }) => {
  return (
    <>
      {/* <Wrapper> */}
      {/* <Zone
        promptLabel="stack"
        promptActive={pickupNow}
        onPrompt={confirmReplenish}
      > */}
      {list.map((c) => (
        <FluidCard key={c.id} card={c} />
      ))}
      {/* </Zone> */}
      {/* {pickupNow && <Throbber point="up" />} */}

      {/* </Wrapper> */}
    </>
  )
}

const mapState = (state: GameState, { uid }: OwnProps) => {
  const selector = highlightedLocationSelector(uid)
  return {
    list: state.stack,
    pickupNow: selector(state) === 'replenish',
  }
}

const mapDispatch = (d: GameDispatch, ownProps: OwnProps) => {
  return {
    confirmReplenish: () => {
      const action = unlockTurn({ channel: 'user:replenish' })
      d(action)
    },
  }
}

interface OwnProps {
  uid: string
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const Stack = connector(_Stack)
