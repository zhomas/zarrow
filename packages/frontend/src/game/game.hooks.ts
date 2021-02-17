import { useState, useEffect } from 'react'
import {
  activeTierSelector,
  canCardPlay,
  CardModel,
  GameState,
  highlightedLocationSelector,
  playCardThunk,
  stackDestinationSelector,
} from 'game'
import { createCardByID } from 'game/dist/deck'
import { FluidCardProps } from '../typings'
import { useDispatch, useSelector } from 'react-redux'

interface Inyerface {
  id: string
  destID: string
  playAllSiblings: (c: CardModel) => void
  toggleHover: (c: CardModel) => void
  selected: string[]
  hovered: string[]
  toggleSelected: (selected: boolean) => void
  hand?: CardModel[]
}

const getNullishCard = (v: FluidCardProps['variant']) => (
  c: CardModel,
): FluidCardProps => {
  return {
    card: c,
    variant: v,
  }
}

export const getCardProps = ({
  id,
  destID,
  playAllSiblings,
  toggleHover,
  selected,
  hovered,
  toggleSelected,
  hand = [],
}: Inyerface): FluidCardProps => {
  const card = createCardByID(id)
  const destination = createCardByID(destID)

  const inCurrentTier = hand.some((c) => c.id === id)
  const canPlay = canCardPlay(card, destination)

  const getVariant = (): FluidCardProps['variant'] => {
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

const pSelect = (id: string) => (s: GameState) =>
  s.players.find((p) => p.id === id)

export const useCardBuilder = (uid: string) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<CardModel[]>([])
  const destination = useSelector(stackDestinationSelector)
  const activeCards = useSelector(activeTierSelector)
  const dispatch = useDispatch()
  const focused = useSelector(highlightedLocationSelector(uid))
  const player = useSelector(pSelect(uid))

  const handCards = player?.cards.filter((c) => c.tier === 2)

  const focusedOnPlayerStrata = focused[1] === uid

  useEffect(() => {
    setHovered([])
    setSelected([])
  }, [activeCards])

  const curried = (c: CardModel) => {
    return getCardProps({
      destID: destination.id,
      selected: selected.map((c) => c.id),
      hovered: hovered.map((h) => h.id),
      id: c.id,
      toggleHover: () => {
        const next = hovered.includes(c)
          ? hovered.filter((h) => h.id !== c.id)
          : [...hovered, c]
        setHovered(next)
      },
      toggleSelected: () => {
        const next = selected.includes(c)
          ? selected.filter((h) => h.id !== c.id)
          : [...selected, c]

        console.log('toggle selected!', next)
        setSelected(next)
      },
      playAllSiblings: () => {
        const siblings = activeCards
          .filter((a) => a.card.value === c.value)
          .map((a) => a.card)

        const action = playCardThunk({ cards: siblings, playerID: uid })
        dispatch(action)
      },
      hand: activeCards.map((a) => a.card),
    })
  }

  return {
    buildHandCard: focused === 'hand' ? curried : getNullishCard('idle'),
    buildNPC: getNullishCard('default'),
    buildForPlayerStrata:
      handCards?.length === 0 && focusedOnPlayerStrata
        ? curried
        : getNullishCard('idle'),
  }
}
