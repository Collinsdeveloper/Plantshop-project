import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

const plantsData = [
  { id: 1, name: 'Snake Plant', image: 'https://example.com/snake.png', price: 24.99 },
  { id: 2, name: 'ZZ Plant', image: 'https://example.com/zz.png', price: 18.0 },
]

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  globalThis.fetch = originalFetch
})

describe('Plant Shop App', () => {
  it('renders all plants on page load', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => plantsData,
    })

    render(<App />)

    expect(screen.getByText(/loading plants/i)).toBeTruthy()

    expect(await screen.findByText('Snake Plant')).toBeTruthy()
    expect(screen.getByText('ZZ Plant')).toBeTruthy()
  })

  it('adds a new plant to the backend and page by form submission', async () => {
    const newPlant = {
      id: 3,
      name: 'Fiddle Leaf Fig',
      image: 'https://example.com/fig.png',
      price: 32.5,
    }

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => plantsData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newPlant,
      })

    render(<App />)

    await screen.findByText('Snake Plant')

    fireEvent.input(screen.getByLabelText(/plant name/i), {
      target: { value: newPlant.name },
    })
    fireEvent.input(screen.getByLabelText(/image url/i), {
      target: { value: newPlant.image },
    })
    fireEvent.input(screen.getByLabelText(/price/i), {
      target: { value: newPlant.price.toString() },
    })

    const form = document.querySelector('form')
    expect(form).toBeTruthy()
    fireEvent.submit(form)

    expect(global.fetch.mock.calls.length).toBe(2)
    expect(global.fetch.mock.calls[1][1]?.method).toBe('POST')

    expect(await screen.findByText('Fiddle Leaf Fig')).toBeTruthy()
  })

  it('allows a user to mark a plant as out of stock', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => plantsData,
    })

    render(<App />)

    await screen.findByText('Snake Plant')

    const outOfStockButton = screen.getAllByRole('button', {
      name: /mark as out of stock/i,
    })[0]

    fireEvent.click(outOfStockButton)

    expect(outOfStockButton.textContent).toMatch(/out of stock/i)
    expect(outOfStockButton.disabled).toBe(true)
  })

  it('filters plants shown on the page by search input', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => plantsData,
    })

    render(<App />)

    await screen.findByText('Snake Plant')

    const searchInput = screen.getByRole('searchbox')
    fireEvent.input(searchInput, { target: { value: 'zz' } })

    await waitFor(() => {
      expect(searchInput.value).toBe('zz')
      expect(screen.getByText('ZZ Plant')).toBeTruthy()
      expect(screen.queryByText('Snake Plant')).toBeNull()
    })
  })
})
