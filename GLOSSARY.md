# Merchant Payouts

A merchant's view of their account: what they hold, what has moved in and out, and sending money out to a bank account.

## Money

**Minor Units**:
The smallest denomination of a currency (pence for GBP, cents for EUR); every amount is an integer count of these.
_Avoid_: cents (when meaning GBP), raw amount

**Account Currency**:
The currency the merchant's balances are held in.
_Avoid_: currency (unqualified), base currency

**Available Balance**:
Funds the merchant can pay out right now.
_Avoid_: balance (unqualified)

**Pending Balance**:
Funds received but not yet available to pay out.
_Avoid_: holding balance, unsettled balance

## Activity

**Activity**:
The chronological record of money moving in and out of the merchant's account.
_Avoid_: transactions, history, ledger

**Activity Item**:
A single entry in the Activity (a deposit, payout, refund or fee), whose amount is a signed movement: positive in, negative out.
_Avoid_: transaction, entry

## Payouts

**Payout**:
An instruction to send an unsigned amount in a Payout Currency from the merchant's account to a Destination IBAN.
_Avoid_: withdrawal, transfer, payment

**Payout Currency**:
The currency the merchant chooses for a Payout; it may differ from the Account Currency.
_Avoid_: currency (unqualified), target currency

**Destination IBAN**:
The bank account a Payout is sent to.
_Avoid_: account number, beneficiary

**High-value Payout**:
A Payout whose amount is strictly greater than 1,000.00 in its Payout Currency.
_Avoid_: large payout, payout over threshold

**Biometric Check**:
The device-level confirmation (Face ID, Touch ID, fingerprint) a merchant must pass before a High-value Payout is sent.
_Avoid_: biometric authentication, login, 2FA

**Device ID**:
The identifier of the merchant's device, attached to each Payout.
_Avoid_: device fingerprint, UDID

## Payout outcomes

**Completed**:
The Payout was accepted and succeeded.

**Failed**:
The Payout was accepted and created, but did not succeed.
_Avoid_: rejected, errored

**Rejected**:
The Payout was refused and never created, e.g. for Insufficient Funds or because the service was unavailable.
_Avoid_: failed, declined

**Insufficient Funds**:
A Rejection because the merchant cannot cover the Payout; only the server decides this.
_Avoid_: not enough balance, overdraft

**Unconfirmed**:
The Payout was sent but no answer came back, so whether it was created is unknown.
_Avoid_: failed, rejected, network error
