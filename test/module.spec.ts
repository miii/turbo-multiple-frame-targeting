import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

describe('Test suite', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
    browser: true,
  })

  describe('Native Turbo', async () => {
    test('Form submission', testTemplate({
      target: 'form',
      updates: { static: false, dynamic: false, form: true },
    }))

    test('Link navigation', testTemplate({
      target: 'link',
      updates: { static: false, dynamic: false, form: true },
    }))
  })

  describe('Module enabled', async () => {
    test('Form submission', testTemplate({
      target: 'form',
      updates: { static: false, dynamic: true, form: true },
      setup: page => page.evaluate('window.$module.enable()'),
    }))

    test('Link navigation', testTemplate({
      target: 'link',
      updates: { static: false, dynamic: true, form: true },
      setup: page => page.evaluate('window.$module.enable()'),
    }))
  })

  describe('Module disabled', async () => {
    test('Form submission', testTemplate({
      target: 'form',
      updates: { static: false, dynamic: false, form: true },
      setup: async (page) => {
        await page.evaluate('window.$module.enable()')
        await page.evaluate('window.$module.disable()')
      },
    }))

    test('Link navigation', testTemplate({
      target: 'link',
      updates: { static: false, dynamic: false, form: true },
      setup: async (page) => {
        await page.evaluate('window.$module.enable()')
        await page.evaluate('window.$module.disable()')
      },
    }))
  })
})

type Page = Awaited<ReturnType<typeof createPage>>
const getSnapshot = (page: Page) => Promise.all([
  page.getByTestId('static-value').textContent(),
  page.getByTestId('dynamic-value').textContent(),
  page.getByTestId('form-value').textContent(),
])

const testTemplate = (opt: {
  setup?: (checkbox: Page) => unknown,
  target: 'link' | 'form',
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

  if (opt.target === 'link')
    await page.getByTestId('link').click()
  else
    await page.getByTestId('form').evaluate((form: HTMLFormElement) => form.requestSubmit())

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