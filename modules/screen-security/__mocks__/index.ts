/**
 * Jest stand-in for the native module (Seam 2). Each function is a jest.fn that tests
 * can script per case; defaults are restored before every test in jest.setup.js.
 */
export const getDeviceId = jest.fn<Promise<string | null>, []>();

export function resetScreenSecurityMock() {
  getDeviceId.mockReset().mockResolvedValue('test-device-id');
}
