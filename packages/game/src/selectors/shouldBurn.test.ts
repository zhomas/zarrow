import it from 'ava'
import { getStore } from '..'
import { createCardByID } from '../deck'
import { shouldBurn } from './index'

it('should burn when three afterimages match', (t) => {
  const store = getStore({
    afterimage: [
      createCardByID('QD'),
      createCardByID('QS'),
      createCardByID('QC'),
    ],
    stack: [],
  })

  const b = shouldBurn(store.getState(), createCardByID('QH'))
  t.is(b, true)
})
