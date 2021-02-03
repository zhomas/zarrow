import React, { FC } from 'react'
import { CardModel } from 'game'
import { relative } from 'path'

type Props = CardModel & { faceDown?: boolean }

export const Card: FC<Props> = ({ suit, value, faceDown, label }) => {
  if (faceDown) {
    return (
      <div
        style={{
          height: 200,
          width: 140,
          background: 'red',
          borderRadius: 10,
          border: '1px solid black',
        }}
      ></div>
    )
  }

  return (
    <div
      style={{
        height: 200,
        width: 140,
        borderRadius: 10,
        border: '1px solid black',
        background: 'white',
        position: 'relative',
        padding: 10,
        color: suit === 'D' || suit === 'H' ? 'red' : 'black',
      }}
    >
      <span>
        {value}
        {suit}
      </span>
    </div>
  )
}
