/** Drives the ScreenSecurity mock (Seam 2) from tests. */
type ScreenSecurityMock = typeof import('@/modules/screen-security/__mocks__');

export function screenSecurityMock(): ScreenSecurityMock {
  return jest.requireMock<ScreenSecurityMock>('@/modules/screen-security');
}
