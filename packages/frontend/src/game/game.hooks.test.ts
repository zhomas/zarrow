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
    hovered: ['3D'],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
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
    hovered: ['3D'],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('3D')],
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
    hovered: ['3D'],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('3D')],
  })

  t.is(props.variant, 'lowlight')
})

it('lowlights siblings when hovered', (t) => {
  const props = getCardProps({
    id: '3H',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: [],
    hovered: ['3D'],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
  })

  t.truthy(props.variant === 'lowlight')
})

it('selects the selected', (t) => {
  const props = getCardProps({
    id: '3H',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: ['3H'],
    hovered: ['3D'],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
  })

  t.truthy(props.selected)
})

it('marks siblings as selectable', (t) => {
  const props = getCardProps({
    id: '3C',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: ['3H'],
    hovered: ['3H'],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('3C')],
  })

  t.truthy(typeof props.onSelect === 'function')
})

it('marks non-siblings as unselectable', (t) => {
  const props = getCardProps({
    id: '4C',
    destID: '3S',
    playAllSiblings: sinon.spy(),
    selected: ['3H'],
    hovered: ['3H'],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('4C')],
  })

  t.truthy(typeof props.onSelect === 'undefined')
})

it('marks cards as disabled when I cannot play', (t) => {
  const props = getCardProps({
    id: '4C',
    destID: '9S',
    playAllSiblings: sinon.spy(),
    selected: [],
    hovered: [],
    toggleHover: sinon.spy(),
    toggleSelected: sinon.spy(),
    hand: [createCardByID('4C')],
  })

  t.is(props.variant, 'disabled')
})
