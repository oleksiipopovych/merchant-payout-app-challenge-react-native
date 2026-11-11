# Send a Payout without a Device ID when it is unavailable

If `ScreenSecurity.getDeviceId()` fails or returns nothing, the Payout is still sent, without `device_id`. The field is optional in the API and serves as a risk signal, not an authorisation; blocking every Payout on a native lookup failure would cost merchants more than omitting one signal. Revisit if the backend ever makes `device_id` mandatory.
