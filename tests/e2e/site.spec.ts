import { expect, test } from '@playwright/test'

test.describe('Pistols at Dawn routes', () => {
  test('the landing page renders its entry prompt and homepage metadata', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    await expect(page).toHaveTitle('Pistols at Dawn')
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1.0')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://pistols.gg')
    const enterPrompt = page.getByText('ENTER', { exact: true })
    await expect(enterPrompt).toBeVisible()
    await expect(page.locator('#About')).toHaveCount(1)
    await expect(page.locator('#Duelists')).toHaveCount(1)
  })

  test('a reload returns the landing page to the entry position', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

    await page.reload()

    await expect(page.getByText('ENTER', { exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('keeps the duelist poster visible until its rendered atlas is ready', async ({ page }, testInfo) => {
    let resolveAtlasRequest: (() => void) | undefined
    const atlasRequestStarted = new Promise<void>((resolve) => {
      resolveAtlasRequest = resolve
    })

    await page.addInitScript(() => {
      Object.defineProperty(HTMLImageElement.prototype, 'decode', {
        configurable: true,
        value: () => Promise.resolve(),
      })
    })
    await page.route('**/images/duelist/sprites/female-idle.png*', async (route) => {
      resolveAtlasRequest?.()
      await new Promise((resolve) => setTimeout(resolve, 1_000))
      await route.continue()
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await atlasRequestStarted
    await page.waitForTimeout(250)

    const duelist = page.locator('[role="img"][aria-label="Female duelist"]')
    const poster = duelist.locator('[data-duelist-poster]')
    const atlas = duelist.locator('[data-duelist-atlas-layer="active"]')
    await testInfo.attach('female-duelist-atlas-race', {
      body: await poster.screenshot(),
      contentType: 'image/png',
    })
    expect(await poster.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
    await expect(poster).toHaveCSS('opacity', '0', { timeout: 5_000 })
    await expect(atlas).toHaveCSS('opacity', '1')
  })

  test('keeps the idle duelist visible while the walking atlas is still loading', async ({ page }) => {
    let releaseWalkingAtlas: (() => void) | undefined
    let resolveWalkingRequest: (() => void) | undefined
    const walkingRequestStarted = new Promise<void>((resolve) => {
      resolveWalkingRequest = resolve
    })
    const walkingAtlasReleased = new Promise<void>((resolve) => {
      releaseWalkingAtlas = resolve
    })

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.route('**/images/duelist/sprites/female-twosteps.png*', async (route) => {
      resolveWalkingRequest?.()
      await walkingAtlasReleased
      await route.continue()
    })
    await page.goto('/')
    await walkingRequestStarted

    const duelist = page.locator('[role="img"][aria-label="Female duelist"]')
    await expect(duelist.locator('[data-duelist-poster]')).toHaveCSS('opacity', '0')
    await page.getByText('ENTER', { exact: true }).click()

    const idleAtlas = duelist.locator('[data-duelist-atlas-layer="active"]')
    const walkingAtlas = duelist.locator('img[src*="female-twosteps.png"]')
    await expect(idleAtlas).toHaveAttribute('src', /female-idle\.png/)
    await expect(idleAtlas).toHaveCSS('opacity', '1')
    await expect(walkingAtlas).toHaveCSS('opacity', '0')
    await expect(duelist).toHaveAttribute('data-animation', 'idle')

    releaseWalkingAtlas?.()
    await expect(duelist).toHaveAttribute('data-animation', 'twosteps')
    await expect(walkingAtlas).toHaveAttribute('data-duelist-atlas-layer', 'active')
    await expect(walkingAtlas).toHaveCSS('opacity', '1')
  })

  test('the World Beyond the Tavern cards retain visible image areas', async ({ page }) => {
    await page.goto('/')
    const socials = page.locator('#Socials')
    await socials.scrollIntoViewIfNeeded()

    const cards = socials.locator('.social-card')
    await expect(cards).toHaveCount(3)
    for (const imageName of ['GitHub', 'Discord', 'X']) {
      const image = socials.getByRole('img', { name: imageName })
      await expect(image).toBeVisible()
      await expect.poll(() => image.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(100)
    }
  })

  test('the Discord page exposes route-specific metadata and its primary action', async ({ page }) => {
    await page.goto('/discord')

    await expect(page).toHaveTitle('Pistols at Dawn: Discord Bot')
    await expect(page.getByRole('heading', { name: 'Settle it in Discord' })).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://pistols.gg/discord')
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://pistols.gg/discord')
    await expect(page.getByRole('link', { name: /add to discord/i }).first()).toHaveAttribute('href', /discord\.com/)
  })

  test('the not-found page remains responsive on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/this-route-does-not-exist')

    await expect(page.getByRole('heading', { name: '404: Page not found' })).toBeVisible()
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1.0')
  })
})
