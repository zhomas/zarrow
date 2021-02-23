import { createCardByID } from 'game/dist/deck'
import { getCardProps } from './game.hooks'
import it from 'ava'
import * as sinon from 'sinon'

it('highlights self when hovered', (t) => {
  const playAll = sinon.spy()

  const props = getCardProps({
    id: '3D',
    destID: '3S',
    playAllSiblings: playAll,
    selected: [],
    hovered: '3D',
    toggleSelected: sinon.spy(),
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
  })

  t.truthy(props.variant === 'highlight')
})

it('highlights selected cards', (t) => {
  const playAll = sinon.spy()

  const props = getCardProps({
    id: '3D',
    destID: '3S',
    playAllSiblings: playAll,
    selected: ['3D'],
    hovered: '3D',

    toggleSelected: sinon.spy(),
    hand: [createCardByID('3D')],
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
  })

  t.is(props.variant, 'highlight')
})

it('lowlights hovered unselected cards', (t) => {
  const playAll = sinon.spy()

  const props = getCardProps({
    id: '3D',
    destID: '3S',
    playAllSiblings: playAll,
    selected: ['3H'],
    hovered: '3D',

    toggleSelected: sinon.spy(),
    hand: [createCardByID('3D')],
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
  })

  t.is(props.variant, 'lowlight')
})

it('lowlights siblings when hovered', (t) => {
  const props = getCardProps({
    id: '3H',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: [],
    hovered: '3D',
    toggleSelected: sinon.spy(),
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
  })

  t.truthy(props.variant === 'lowlight')
})

it('selects the selected', (t) => {
  const props = getCardProps({
    id: '3H',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: ['3H'],
    hovered: '3D',
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
    toggleSelected: sinon.spy(),
  })

  t.true(props.selected)
})

it('marks siblings as selectable', (t) => {
  const props = getCardProps({
    id: '3C',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: ['3H'],
    hovered: '3H',
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('3C')],
  })

  t.is(typeof props.onSelect, 'function')
  t.is(props.selectable, true)
})

it('marks non-siblings as unselectable', (t) => {
  const props = getCardProps({
    id: '4C',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: ['3H'],
    hovered: '3H',
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('4C')],
  })

  t.is(props.selectable, false)
})

it('marks cards as disabled when I cannot play', (t) => {
  const props = getCardProps({
    id: '4C',
    destID: '9S',
    playAllSiblings: sinon.spy(),
    selected: [],
    hovered: '',
    hoverStart: sinon.spy(),
    hoverEnd: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('4C')],
  })

  t.is(props.variant, 'disabled')
})
