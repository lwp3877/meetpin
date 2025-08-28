// jest.setup.js
import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
})

// Mock global fetch
global.fetch = jest.fn()

// Mock global kakao
global.kakao = {
  maps: {
    load: jest.fn((callback) => callback()),
    LatLng: jest.fn(),
    Map: jest.fn(),
    Marker: jest.fn(),
    InfoWindow: jest.fn(),
    event: {
      addListener: jest.fn(),
    },
    services: {
      Geocoder: jest.fn(() => ({
        addressSearch: jest.fn(),
        coord2Address: jest.fn(),
      })),
    },
  },
}