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

const TopThing = styled.div`
  &&& {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 10;
    text-align: center;
    pointer-events: none;
    padding: 136px;
    color: white;
  }
`

const _Targeter: FC<Props> = ({
  activeTarget,
  activeReveal,
  uid,
  children,
  bombsAway,
  psychicReveals,
  chaining,
}) => {
  const [targ, setTarg] = useState('')

  useEffect(() => {
    document.body.classList.toggle('targeting', activeTarget)
  }, [activeTarget])

  useEffect(() => {
    document.body.classList.toggle('revealing', activeReveal)
  }, [activeReveal])

  const getPlayerHighlight = (id: string) => {
    if (!activeTarget) return 'none'
    if (id === uid) return 'none'
    if (targ === id) return 'ace:hover'

    return 'ace:able'
  }

  return (
    <>
      {children({
        isTargeting: activeTarget,
        isRevealing: activeReveal,
        targetID: targ,
        screenComponent: <Screen />,
        getCurrentHighlight: getPlayerHighlight,
        setTarget: setTarg,
        fire: () => bombsAway(targ),
      })}

      {activeTarget && (
        <>
          {' '}
          <BottomThing>Pick a target</BottomThing>
        </>
      )}

      {activeReveal && (
        <>
          {' '}
          <TopThing>
            <h4>Psychic reveal ({psychicReveals})</h4>
            {chaining && <h5>CHAIN!</h5>}
          </TopThing>
        </>
      )}
    </>
  )
}

interface ChildrenProps {
  isTargeting: boolean
  isRevealing: boolean
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
    activeReveal: mode === 'play:reveal',
    activeTarget: mode === 'play:target',
    chaining: state.turnClocks.includes('chainedqueen'),
    psychicReveals: state.turnLocks?.filter((l) => l === 'user:psychicreveal')
      .length,
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
