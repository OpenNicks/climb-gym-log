// Test utility helpers for fetch mocks and async patterns

export function mockFetchResponseOnce(data, ok = true) {
  global.fetch.mockResolvedValueOnce({
    ok,
    json: async () => data,
    text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
  });
}
