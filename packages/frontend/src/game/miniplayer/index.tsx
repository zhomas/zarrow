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
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'
import { Strata } from '../strata'
import { Throbber } from '../throbber'

const Wrapper = styled.div`
  background: rgb(0 0 0 / 33%);
  padding: 20px 240px 85px 25px;
`

const InfoList = styled.ul`
  position: absolute;
  top: 10px;
  right: 90px;
  color: white;
  text-align: left;
`

const _MiniPlayer: FC<Props> = ({
  ownerID,
  cardsInHand,
  modeString,
  showActivityWidget,
  nudge = 'down',
  fadedStrata = false,
}) => {
  const nothing = (c: CardModel): FluidCardProps => {
    return {
      card: c,
    }
  }

  return (
    <motion.div
      initial={{
        scale: 0.85,
        transformOrigin: nudge === 'down' ? 'top' : 'bottom',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: nudge === 'down' ? 'column' : 'column-reverse',
        }}
      >
        <Wrapper
          style={{
            borderRadius: nudge === 'down' ? '0 0 9px 9px' : '9px 9px 0 0',
            padding:
              nudge === 'down'
                ? '20px 240px 85px 25px'
                : '85px 240px 20px 25px',
          }}
        >
          <div style={{ opacity: fadedStrata ? 0.5 : 1 }}>
            <Strata
              ownerID={ownerID}
              curried={nothing}
              active={false}
              mode={'idle'}
              nudge={nudge}
            />
          </div>
          <InfoList>
            <li></li>
            <li>
              <span>{modeString}</span>
            </li>
            <li>
              <span>{cardsInHand} in hand</span>
            </li>
          </InfoList>
        </Wrapper>
        {showActivityWidget && (
          <Throbber point={nudge === 'down' ? 'down' : 'up'} />
        )}
      </div>
    </motion.div>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const myCards =
    state.players.find((p) => p.id === ownProps.ownerID)?.cards || []
  const dest = stackDestinationSelector(state)
  const modeSelector = userModeSelector(ownProps.ownerID)

  const getString = () => {
    switch (modeSelector(state)) {
      case 'play:hand':
      case 'play:downs':
      case 'play:ups':
        return 'Green...'
      case 'pickup:stack':
        return 'Red...'
      case 'pickup:replenish':
        return 'Amber...'
      default:
        return 'gray'
    }
  }

  return {
    downs: myCards.filter((c) => c.tier === 0),
    ups: myCards.filter((c) => c.tier === 1),
    canCardPlay: (c: CardModel) => canCardPlay(c, dest),
    isFocused: (c: CardModel) => !!state.focused && state.focused === c.id,
    active: !modeSelector(state).includes('idle'),
    modeString: getString(),
    cardsInHand: myCards.filter((c) => c.tier === 2).length,
  }
}

const mapDispatch = (dispatch: GameDispatch, own: OwnProps) => {
  return {
    playCard: (c: CardModel) => {
      const action = playCardThunk({ cards: [c], playerID: own.ownerID })
      dispatch(action)
    },
    focusCard: (c: CardModel) => {
      const action = focus(c.id)
      dispatch(action)
    },
  }
}

interface OwnProps {
  ownerID: string
  curried: (c: CardModel, a: boolean) => FluidCardProps
  nudge?: 'up' | 'down'
  fadedStrata?: boolean
  showActivityWidget?: boolean
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const Miniplayer = connector(_MiniPlayer)
