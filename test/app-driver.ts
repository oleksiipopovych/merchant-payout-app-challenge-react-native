/**
 * Drives the app the way a merchant would, so tests read as merchant steps and screen details
 * (button names, the tab label format) live in one place.
 */
import { fireEvent, screen } from 'expo-router/testing-library';

import type { Currency } from '@/types/api';

export const VALID_IBAN = 'GB29NWBK60161331926819';

export type PayoutFormInput = {
  amount: string;
  currency?: Currency;
  iban?: string;
};

/** Types the amount, picks the Payout Currency (if not GBP) and types the Destination IBAN. */
export function fillPayoutForm({ amount, currency = 'GBP', iban = VALID_IBAN }: PayoutFormInput) {
  fireEvent.changeText(screen.getByLabelText('Amount'), amount);
  if (currency !== 'GBP') {
    fireEvent.press(screen.getByRole('combobox', { name: 'Currency' }));
    fireEvent.press(screen.getByRole('menuitem', { name: currency }));
  }
  fireEvent.changeText(screen.getByLabelText('IBAN'), iban);
}

/** Presses the form's Confirm, opening the summary. */
export function reviewPayout() {
  fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
}

/** Presses Confirm on the summary, sending the Payout. */
export function confirmPayout() {
  fireEvent.press(screen.getByRole('button', { name: 'Confirm payout' }));
}

/** Fills the form, reviews and confirms: the whole path to sending a Payout. */
export function sendPayout(form: PayoutFormInput) {
  fillPayoutForm(form);
  reviewPayout();
  confirmPayout();
}

/** Switches bottom tab. The tab buttons are labelled e.g. "Home, tab, 1 of 2". */
export function goToTab(tab: 'Home' | 'Payouts') {
  fireEvent.press(screen.getByRole('button', { name: new RegExp(`^${tab}, tab`) }));
}

/** Opens the Activity sheet from Home's "Show More", waiting for Home to load first. */
export async function openActivitySheet() {
  fireEvent.press(await screen.findByRole('button', { name: 'Show more activity' }));
}
