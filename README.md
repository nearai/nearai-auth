# NEARAI Auth

Displays a list of wallets from `wallet-selector` and allows signing a message with a NEAR account without adding an access key.

# How to run

```
npm i
npm run dev
```


# How to use

Redirect to this app and provide the following args in `location.hash`:

- `message` - String
- `recipient` - NEAR Account 
- `serverCallbackUrl` - URL to receive the final signature
- `nonce` (optional) - Uint8Array(32)

Example: 
```
http://localhost/#serverCallbackUrl=http%3A%2F%2Flocalhost%3A53919%2Fauth&message=Welcome+To+NearAI+HUB&nonce=11111111111111111111111111111111&recipient=ai.near
```

The app will create a request to sign the message and redirect the user's signature to `serverCallbackUrl` with the following arguments:
 
- accountId
- signature
- publicKey
- signMessageParams

`signMessageParams` is a JSON stringified object containing the initial arguments signed by the user:
(message, recipient, callbackUrl, nonce).

**Important!** The `serverCallbackUrl` provided to the app is not the same as `callbackUrl` signed by user. This is done to unify the data interface, as injected and web wallets handle callback data differently.

**Important!** Your server may not trust `signMessageParams` provided by this app and should store `message`, `recipient`, and `nonce` internally. This ensures that you receive the user's signature for your specific message and not for any other message.