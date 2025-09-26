// Mock implementation for Kakao Maps SDK
export function injectMapsMock() {
  return `
    window.kakao = {
      maps: {
        Map: class MockMap {
          constructor(container, options) {
            console.log('Mock Kakao Map created');
          }
          addControl() {}
          panTo() {}
          setLevel() {}
          getBounds() {
            return {
              getSouthWest: () => ({ getLat: () => 37.5, getLng: () => 126.9 }),
              getNorthEast: () => ({ getLat: () => 37.6, getLng: () => 127.1 })
            };
          }
        },
        Marker: class MockMarker {
          constructor(options) {}
          setMap() {}
        },
        MarkerImage: class MockMarkerImage {
          constructor(src, size, options) {}
        },
        MarkerClusterer: class MockMarkerClusterer {
          constructor(options) {}
          addMarkers() {}
          clear() {}
        },
        InfoWindow: class MockInfoWindow {
          constructor() {}
          setContent() {}
          open() {}
          close() {}
        },
        LatLng: class MockLatLng {
          constructor(lat, lng) {
            this.lat = lat;
            this.lng = lng;
          }
          getLat() { return this.lat; }
          getLng() { return this.lng; }
        },
        Size: class MockSize {
          constructor(width, height) {}
        },
        Point: class MockPoint {
          constructor(x, y) {}
        },
        MapTypeControl: class MockMapTypeControl {},
        ZoomControl: class MockZoomControl {},
        ControlPosition: {
          TOPRIGHT: 'TOPRIGHT',
          RIGHT: 'RIGHT'
        },
        event: {
          addListener: () => {}
        }
      }
    };
  `;
}
