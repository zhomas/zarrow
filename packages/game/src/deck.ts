import { getWrappedIndex } from './utils'
import { CardModel, suits, values } from './types'
import { Dictionary } from '@reduxjs/toolkit'

type Value = typeof values[number]
type Suit = typeof suits[number]

export const createCard = (value: Value, suit: Suit): CardModel => {
  return { suit, value, id: `${value}${suit}` }
}

export const createDeck = (size: number = 52): CardModel[] => {
  const unshuffled = new Array(size).fill(null).map((_, i) => {
    const suitIndex = getWrappedIndex(i, suits.length)
    const valueIndex = getWrappedIndex(i, values.length)
    return createCard(values[valueIndex], suits[suitIndex])
  })

  return unshuffled
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
}

const deck: Dictionary<CardModel> = createDeck(52).reduce((obj, item) => {
  return {
    ...obj,
    [item.id]: item,
  }
}, {})

export const createCardByID = (cID: string) => {
  return deck[cID]
}
