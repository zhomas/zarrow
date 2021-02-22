import React, { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GameDispatch, GameState, unlockTurn, userModeSelector } from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { styled } from '@linaria/react'
import { Screen } from '../game.style'

const BottomThing = styled.div`
  &&& {
    position: fixed;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: rgba(255, 255, 255, 0.5);
    z-index: 2;
    text-align: center;
    pointer-events: none;
    padding: 136px;
  }
`

const _Targeter: FC<Props> = ({ active, uid, children, bombsAway }) => {
  const [targ, setTarg] = useState('')

  useEffect(() => {
    document.body.classList.toggle('targeting', active)
  }, [active])

  const getPlayerHighlight = (id: string) => {
    if (!active) return 'none'
    if (id === uid) return 'none'
    if (targ === id) return 'ace:hover'

    return 'ace:able'
  }

  return (
    <>
      {children({
        isTargeting: active,
        targetID: targ,
        screenComponent: <Screen />,
        getCurrentHighlight: getPlayerHighlight,
        setTarget: setTarg,
        fire: () => bombsAway(targ),
      })}

      {active && (
        <>
          {' '}
          <BottomThing>Pick a target</BottomThing>
        </>
      )}
    </>
  )
}

interface ChildrenProps {
  isTargeting: boolean
  targetID: string
  screenComponent: JSX.Element
  setTarget: (id: string) => void
  fire: () => void
  getCurrentHighlight: (id: string) => 'none' | 'ace:able' | 'ace:hover'
}

const mapState = (state: GameState, props: OwnProps) => {
  const selectMode = userModeSelector(props.uid)
  const mode = selectMode(state)
  return {
    active: mode === 'play:target',
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    bombsAway: (targID: string) => {
      const action = unlockTurn({ channel: 'user:target', data: targID })
      dispatch(action)
    },
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  uid: string
  children: (x: ChildrenProps) => JSX.Element
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const Targeter = connector(_Targeter)
