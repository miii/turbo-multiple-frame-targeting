import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

describe('Test suite', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
    browser: true,
  })

  describe('Native Turbo', async () => {
    describe('Form submission', async () => {
      test('#form should only refresh _self', testTemplate({
        target: 'form',
        updates: { static: false, dynamic: false, form: true },
      }))

      test('#form-self should only refresh _self', testTemplate({
        target: 'form-self',
        updates: { static: false, dynamic: false, form: true },
      }))
    })

    describe('Link navigation', async () => {
      test('#link should only refresh _self', testTemplate({
        target: 'link',
        updates: { static: false, dynamic: false, form: true },
      }))

      test('#link-self should only refresh _self', testTemplate({
        target: 'link-self',
        updates: { static: false, dynamic: false, form: true },
      }))
    })
  })

  describe('With module enabled', async () => {
    describe('Form submission', async () => {
      test('#form should refresh _self + dynamic', testTemplate({
        target: 'form',
        updates: { static: false, dynamic: true, form: true },
        setup: page => page.evaluate('window.$module.enable()'),
      }))

      test('#form-self should refresh _self + dynamic', testTemplate({
        target: 'form-self',
        updates: { static: false, dynamic: true, form: true },
        setup: page => page.evaluate('window.$module.enable()'),
      }))
    })

    describe('Link navigation', async () => {
      test('#link should refresh _self + dynamic', testTemplate({
        target: 'link',
        updates: { static: false, dynamic: true, form: true },
        setup: page => page.evaluate('window.$module.enable()'),
      }))

      test('#link-self should refresh _self + dynamic', testTemplate({
        target: 'link-self',
        updates: { static: false, dynamic: true, form: true },
        setup: page => page.evaluate('window.$module.enable()'),
      }))
    })
  })

  describe('With module enabled then disabled', async () => {
    describe('Form submission', async () => {
      test('#form should only refresh _self', testTemplate({
        target: 'form',
        updates: { static: false, dynamic: false, form: true },
        setup: async (page) => {
          await page.evaluate('window.$module.enable()')
          await page.evaluate('window.$module.disable()')
        },
      }))

      test('#form-self should only refresh _self', testTemplate({
        target: 'form-self',
        updates: { static: false, dynamic: false, form: true },
        setup: async (page) => {
          await page.evaluate('window.$module.enable()')
          await page.evaluate('window.$module.disable()')
        },
      }))
    })

    describe('Link navigation', async () => {
      test('#link should only refresh _self', testTemplate({
        target: 'link',
        updates: { static: false, dynamic: false, form: true },
        setup: async (page) => {
          await page.evaluate('window.$module.enable()')
          await page.evaluate('window.$module.disable()')
        },
      }))

      test('#link-self should only refresh _self', testTemplate({
        target: 'link-self',
        updates: { static: false, dynamic: false, form: true },
        setup: async (page) => {
          await page.evaluate('window.$module.enable()')
          await page.evaluate('window.$module.disable()')
        },
      }))
    })
  })
})

type Page = Awaited<ReturnType<typeof createPage>>
const getSnapshot = (page: Page) => Promise.all([
  page.getByTestId('static-value').textContent(),
  page.getByTestId('dynamic-value').textContent(),
  page.getByTestId('form-value').textContent(),
])

type Target<T extends string> = T | `${T}-${string}`
const testTemplate = (opt: {
  setup?: (checkbox: Page) => unknown,
  target: Target<'form' | 'link'>,
  updates: {
    static: boolean
    dynamic: boolean
    form: boolean
  },
}) => async () => {
  const page = await createPage('/')
  const [staticBefore, dynamicBefore, formBefore] = await getSnapshot(page)
  const turboFormRequest = page.waitForResponse(page.url())

  opt.setup?.(page)
  await new Promise(resolve => setTimeout(resolve, 50))

  if (opt.target.startsWith('link'))
    await page.getByTestId(opt.target).click()
  else
    await page.getByTestId(opt.target).evaluate((form: HTMLFormElement) => form.requestSubmit())

  await turboFormRequest
  await new Promise(resolve => setTimeout(resolve, 50))
  const [staticAfter, dynamicAfter, formAfter] = await getSnapshot(page)

  if (opt.updates.static) expect(staticBefore).not.toEqual(staticAfter)
  else expect(staticBefore).toEqual(staticAfter)

  if (opt.updates.dynamic) expect(dynamicBefore).not.toEqual(dynamicAfter)
  else expect(dynamicBefore).toEqual(dynamicAfter)

  if (opt.updates.form) expect(formBefore).not.toEqual(formAfter)
  else expect(formBefore).toEqual(formAfter)
}