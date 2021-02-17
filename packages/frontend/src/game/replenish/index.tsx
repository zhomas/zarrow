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

const _ReplenishPile: FC<Props> = ({ list, pickupNow, confirmReplenish }) => {
  return (
    <Wrapper>
      <Zone
        promptActive={pickupNow}
        onPrompt={confirmReplenish}
        cards={list.map((c) => {
          return <FluidCard card={c} faceDown />
        })}
      ></Zone>
      {pickupNow && <Throbber point="up" />}
    </Wrapper>
  )
}

const mapState = (state: GameState, { uid }: OwnProps) => {
  const selector = highlightedLocationSelector(uid)
  return {
    list: state.pickupPile,
    pickupNow: false, // selector(state) === 'replenish',
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

export const ReplenishPile = connector(_ReplenishPile)
