import type { CardModel, UserMode } from 'game'
import { canCardPlay } from 'game'
import { FluidCardProps } from '../typings'
import { useEffect, useState } from 'react'
import { createCardByID } from 'game/dist/deck'

interface ViewModelProps {
  currentMode: UserMode
  list: CardModel[]
  destination: CardModel
  playAll: (...c: CardModel[]) => void
}

interface Inyerface {
  id: string
  destID: string
  playAllSiblings: (c: CardModel) => void
  toggleHover: (c: CardModel) => void
  selected: string[]
  hovered: string[]
  toggleSelected: (selected: boolean) => void
  active: boolean
  hand?: CardModel[]
}

export const getCardProps = ({
  id,
  destID,
  playAllSiblings,
  toggleHover,
  selected,
  hovered,
  toggleSelected,
  active,
  hand = [],
}: Inyerface): FluidCardProps => {
  const card = createCardByID(id)
  const destination = createCardByID(destID)

  const inCurrentTier = hand.some((c) => c.id === id)
  const canPlay = canCardPlay(card, destination)

  const getVariant = (): FluidCardProps['variant'] => {
    if (!active) return 'default'

    if (!canPlay) return 'disabled'

    if (selected.length > 0) {
      if (card.value !== createCardByID(selected[0]).value) return 'default'
      if (selected.some((c) => c === id)) return 'highlight'
      if (hovered.includes(card.id)) return 'lowlight'
      return 'default'
    }

    if (!selected.length) {
      if (hovered.includes(card.id)) return 'highlight'

      if (hovered.some((h) => createCardByID(h).value === card.value))
        return 'lowlight'
    }

    return 'default'
  }

  const getSelectable = () => {
    if (!inCurrentTier) return false
    if (!canPlay) return false
    if (selected.some((cID) => createCardByID(cID).value === card.value))
      return true

    if (hand.some((x) => x.id !== id && x.value === card.value)) return true
    return false
  }

  const getOnClick = () => {
    if (!canPlay) return undefined
    if (selected.length > 0) return undefined
    return () => playAllSiblings(card)
  }

  return {
    card: card,
    selected: selected.includes(card.id),
    onMouseEnter: () => toggleHover(card),
    onMouseExit: () => toggleHover(card),
    onClick: getOnClick(),
    onSelect: getSelectable()
      ? (selected) => toggleSelected(selected)
      : undefined,
    variant: getVariant(),
  }
}

type Curried = Readonly<
  Omit<Inyerface, 'toggleHover' | 'toggleSelected' | 'selected' | 'hovered'>
>

export const useGameViewModel = (args: ViewModelProps) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<CardModel[]>([])

  useEffect(() => {
    setSelected([])
    setHovered([])
  }, [args.currentMode])

  const curried = (a: Curried) => {
    return getCardProps({
      active: a.active,
      destID: a.destID,
      selected: selected.map((c) => c.id),
      hovered: hovered.map((h) => h.id),
      id: a.id,
      toggleHover: (c) => {
        const next = hovered.includes(c)
          ? hovered.filter((h) => h.id !== c.id)
          : [...hovered, c]

        setHovered(next)
      },
      toggleSelected: (checked) => {
        const next = checked
          ? [...selected, createCardByID(a.id)]
          : selected.filter((c) => c.id !== a.id)

        setSelected(next)
      },
      playAllSiblings: a.playAllSiblings,
      hand: a.hand,
    })
  }

  return {
    getCardProps: curried,
    playSelected: () => {
      args.playAll(...selected)
    },
  }
}
