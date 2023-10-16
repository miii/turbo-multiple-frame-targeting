import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

describe('Module', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
    browser: true,
  })

  describe('Without parent <turbo-frame>', () => {
    test('<a data-turbo-frame="frame-1"> should update #frame-1', testTemplate({
      target: 'a-native',
      updates: { frame1: true },
    }))

    test('<a data-turbo-frame="frame-1 frame-2"> should update #frame-1 + #frame-2', testTemplate({
      target: 'a-multiple',
      updates: { frame1: true, frame2: true },
    }))
          
    test('<form data-turbo-frame="frame-1"> should update #frame-1', testTemplate({
      target: 'form-native',
      updates: { frame1: true },
    }))

    test('<form data-turbo-frame="frame-1 frame-2"> should update #frame-1 + #frame-2', testTemplate({
      target: 'form-multiple',
      updates: { frame1: true, frame2: true },
    }))
  })

  describe('Placed inside <turbo-frame>', async () => {
    test('<a> should update #parent', testTemplate({
      target: 'a-scoped-none',
      updates: { parent: true },
    }))

    test('<a data-turbo-frame="_self"> should update #parent', testTemplate({
      target: 'a-scoped-self',
      updates: { parent: true },
    }))

    test('<a data-turbo-frame="_self frame-2"> should update #parent + #frame-2', testTemplate({
      target: 'a-multiple',
      updates: { parent: true, frame2: true },
    }))
    
    test('<form> should update #parent', testTemplate({
      target: 'form-scoped-none',
      updates: { parent: true },
    }))

    test('<form data-turbo-frame="_self"> should update #parent', testTemplate({
      target: 'form-scoped-self',
      updates: { parent: true },
    }))

    test('<form data-turbo-frame="_self"> should update #parent', testTemplate({
      target: 'form-scoped-multiple',
      updates: { parent: true, frame2: true },
    }))
  })
})

type Page = Awaited<ReturnType<typeof createPage>>
const getSnapshot = (page: Page) => Promise.all([
  page.getByTestId('frame-static').textContent(),
  page.getByTestId('frame-1').textContent(),
  page.getByTestId('frame-2').textContent(),
  page.getByTestId('frame-parent').textContent(),
])

type AnchorTestId<T extends string> = `a-${T}`
type FormTestId<T extends string> = `form-${T}`
type ButtonVariants = 'native' | 'multiple' |
  'scoped-none' | 'scoped-self' | 'scoped-multiple'
type Buttons = AnchorTestId<ButtonVariants> | FormTestId<ButtonVariants>

type Updates = {
  frame1?: boolean
  frame2?: boolean
  parent?: boolean
}

const testTemplate = (opt: {
  /** Run initial code */
  setup?: (checkbox: Page) => unknown,
  /** Button target */
  target: Buttons,
  /** Expected DOM updates */
  updates: Updates,
}) => async () => {
  const page = await createPage('/')
  const [staticBefore, frame1Before, frame2Before, parentBefore] = await getSnapshot(page)

  const targetEl = page.getByTestId(opt.target)
  const turboFormRequest = page.waitForResponse(page.url())

  // Run optional setup code
  opt.setup?.(page)

  if (opt.target.startsWith('a')) {
    await targetEl.click()
  }
  else
    await targetEl.evaluate((form: HTMLFormElement) => form.requestSubmit())

  // Wait for turbo-frame to be updated
  await turboFormRequest
  await new Promise(resolve => setTimeout(resolve, 50))

  const [staticAfter, frame1After, frame2After, parentAfter] = await getSnapshot(page)

  // Assert static frame
  expect(staticBefore, 'static frame should not be refreshed').toEqual(staticAfter)

  // Assert dynamic frames
  if (opt.updates.frame1) expect(frame1Before, 'frame 1 should be updated').not.toEqual(frame1After)
  else expect(frame1Before, 'frame 1 should not be updated').toEqual(frame2After)

  if (opt.updates.frame2) expect(frame2Before, 'frame 2 should be updated').not.toEqual(frame2After)
  else expect(frame2Before, 'frame 2 should not be updated').toEqual(frame2After)

  if (opt.updates.parent) expect(parentBefore, 'parent frame should be updated').not.toEqual(parentAfter)
  else expect(parentBefore, 'parent frame should not be updated').toEqual(parentAfter)
}