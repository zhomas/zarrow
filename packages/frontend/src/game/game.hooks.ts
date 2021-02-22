import { useState, useEffect } from 'react'
import {
  activeTierSelector,
  canCardPlay,
  CardModel,
  GameState,
  hasLock,
  highlightedLocationSelector,
  playCardThunk,
  stackDestinationSelector,
  userModeSelector,
} from 'game'
import { createCardByID } from 'game/dist/deck'
import { FluidCardProps } from '../typings'
import { useDispatch, useSelector } from 'react-redux'

interface Inyerface {
  id: string
  destID: string
  playAllSiblings: (c: CardModel) => void
  hoverStart: () => void
  hoverEnd: () => void
  selected: string[]
  hovered: string
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
  selected,
  hovered,
  toggleSelected,
  hoverStart,
  hoverEnd,
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

    if (!!hovered && !selected.length) {
      if (hovered === card.id) return 'highlight'

      if (createCardByID(hovered).value === card.value) return 'lowlight'
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
    onMouseEnter: hoverStart,
    onMouseExit: hoverEnd,
    onClick: getOnClick(),
    onSelect: getSelectable()
      ? (selected) => toggleSelected(selected)
      : undefined,
    variant: getVariant(),
  }
}

const pSelect = (id: string) => (s: GameState) =>
  s.players.find((p) => p.id === id)

const stackSelect = (state: GameState) => state.stack
const burnSelect = (state: GameState) => state.burnt

const activeUserSelector = (state: GameState) => state.queue[0]

const isAnimating = hasLock('animate')

export const useCardBuilder = (uid: string) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<string>('')
  const destination = useSelector(stackDestinationSelector)
  const activeCards = useSelector(activeTierSelector)
  const dispatch = useDispatch()
  const focused = useSelector(highlightedLocationSelector(uid))
  const player = useSelector(pSelect(uid))
  const userMode = useSelector(userModeSelector(uid))
  const active = useSelector(activeUserSelector)

  const handCards = player?.cards.filter((c) => c.tier === 2)

  const focusedOnPlayerStrata = focused[1] === uid

  const anim = useSelector(isAnimating)

  useEffect(() => {
    setHovered('')
  }, [active])

  const curried = (c: CardModel) => {
    const toggleSelected = () => {
      const next = selected.includes(c)
        ? selected.filter((h) => h.id !== c.id)
        : [...selected, c]

      console.log('toggle selected!', next)
      setSelected(next)
    }

    const playAllSiblings = () => {
      const cards = activeCards
        .filter((a) => a.card.value === c.value)
        .map((a) => a.card)

      dispatch(playCardThunk({ cards, playerID: uid }))
    }

    return getCardProps({
      destID: destination.id,
      selected: selected.map((c) => c.id),
      hovered,
      hand: activeCards.map((a) => a.card),
      id: c.id,
      toggleSelected,
      playAllSiblings,
      hoverStart: () => {
        setHovered(c.id)
      },
      hoverEnd: () => {
        if (hovered === c.id) {
          setHovered('')
        }
      },
    })
  }

  const getHandCardBuilder = () => {
    if (anim) return getNullishCard('idle')

    switch (userMode) {
      case 'play:hand':
        return curried
      default:
        return getNullishCard('idle')
    }
  }

  const getFaceUpBuilder = () => {
    if (anim) return getNullishCard('idle')

    return handCards?.length === 0 && focusedOnPlayerStrata
      ? curried
      : getNullishCard('idle')
  }

  return {
    buildHandCard: getHandCardBuilder(),
    buildNPC: getNullishCard('default'),
    buildForPlayerStrata: getFaceUpBuilder(),
    hovered,
  }
}
