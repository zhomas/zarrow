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
  highlightedLocationSelector,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'
import { Strata } from '../strata'
import { Throbber } from '../throbber'

const Wrapper = styled(motion.div)`
  background: rgb(0 0 0 / 33%);
  padding: 20px 240px 85px 25px;
`

const _MiniPlayer: FC<Props> = ({
  uid,
  ownerID,
  highlighted,
  nudge = 'down',
  fadedStrata = false,
  curried,
}) => {
  return (
    <>
      <Wrapper
        initial={{
          transformOrigin: nudge === 'down' ? 'top' : 'bottom',
        }}
        style={{
          borderRadius: nudge === 'down' ? '0 0 9px 9px' : '9px 9px 0 0',
          padding:
            nudge === 'down' ? '20px 62px 85px 25px' : '85px 62px 20px 25px',
        }}
      >
        <div style={{ opacity: fadedStrata ? 0.5 : 1 }}>
          <Strata
            uid={uid}
            ownerID={ownerID}
            curried={curried}
            active={false}
            nudge={nudge}
          />
        </div>
      </Wrapper>
      {highlighted && (
        <Throbber
          point={nudge === 'down' ? 'up' : 'down'}
          top={nudge === 'up' ? -30 : '100%'}
        />
      )}
    </>
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

  const selector = highlightedLocationSelector(ownProps.uid)
  const h = selector(state)
  return {
    highlighted: h[1] === ownProps.ownerID,
    downs: myCards.filter((c) => c.tier === 0),
    ups: myCards.filter((c) => c.tier === 1),
    canCardPlay: (c: CardModel) => canCardPlay(c, dest),
    isFocused: (c: CardModel) => !!state.focused && state.focused === c.id,
    active: !modeSelector(state).includes('idle'),
    modeString: getString(),
    cardsInHand: myCards.filter((c) => c.tier === 2).length,
    hand: myCards.filter((c) => c.tier === 2),
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
  uid: string
  ownerID: string
  curried: (c: CardModel, a: boolean) => FluidCardProps
  nudge?: 'up' | 'down'
  fadedStrata?: boolean
  showActivityWidget?: boolean
  renderHandCards?: boolean
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const Miniplayer = connector(_MiniPlayer)
