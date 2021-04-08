import { css } from '@linaria/core'
import { styled } from '@linaria/react'
import { motion } from 'framer-motion'
import { createDeck } from 'game'
import React, { FC } from 'react'
import { Throbber } from '../throbber'

const ids = createDeck().cards.map((c) => c.id)

interface ZoneProps {
  onPrompt?: () => void
  promptActive: boolean
  cards: JSX.Element[]
}

const deckBox = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid #0000007d;
  border-radius: 12px;
  z-index: -1;
`

const DeckBox = styled.div`
  background: #fff1d821;
`

export const Zone: FC<ZoneProps> = ({
  promptActive,
  children,
  onPrompt,
  cards,
}) => {
  return (
    <div
      style={{
        marginRight: 1,
      }}
    >
      <div
        onClick={promptActive ? onPrompt : undefined}
        style={{
          padding: 10,
          position: 'relative',
          zIndex: 0,

          cursor: promptActive ? 'grab' : 'default',
        }}
      >
        <DeckBox className={deckBox} />
        {promptActive && (
          <motion.div
            className={deckBox}
            animate={{
              backgroundColor: [
                'rgba(255, 225, 53, 1)',
                'rgba(255, 225, 53, 0)',
              ],
            }}
            transition={{
              repeatType: 'mirror',
              repeat: promptActive ? Infinity : 1,
              duration: 0.25,
              ease: 'easeInOut',
            }}
          />
        )}

        <div
          style={{
            position: 'relative',
            width: 126,
            height: 176,
            pointerEvents: 'none',
            top: cards.length * -1.5,
          }}
        >
          <motion.div>
            {cards.map((c, i) => (
              <div
                key={ids[i]}
                style={{
                  position: 'absolute',
                  top: i * 1.5,
                  left: 0,
                  zIndex: cards.length - i,
                }}
              >
                {c}
              </div>
            ))}
          </motion.div>
          {promptActive && <Throbber point="up" top="120%" left="25%" />}
        </div>
      </div>
    </div>
  )
}
