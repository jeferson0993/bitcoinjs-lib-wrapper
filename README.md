# BitcoinJS Library Wrapper Documentation

## Overview

The `bitcoinjs-lib-wrapper` library is a JavaScript/Typescript implementation of various functionalities for generating and managing Bitcoin wallets and performing transactions. It supports different types of addresses (P2PKH, P2SH-SegWit, Bech32), as well as implementing functionalities for HD (Hierarchical Deterministic) wallets and transactions with advanced scripts.

## Installation

### Using NPM for Node.js Projects
```bash
npm install bitcoinjs-lib-wrapper
```

### Using CDN for vanilla javascript in browser
```html
<script src="https://unpkg.com/browse/bitcoinjs-lib-wrapper@latest/dist/bitcoinjs-lib-wrapper.js"></script>
```

## Building from source code

### Browserify (for browser usage)
To bundle for the browser, use the following command:
```bash
npm run build
```

### Minify (for browser usage)
To bundle for the browser, use the following command:
```bash
uglifyjs dist/index.js --compress --mangle --output dist/index.min.js
```

---

## Library API

### **`getNewP2PKHWallet([networkInput])`**

Creates a new P2PKH (Legacy) wallet with a new private key.

#### Parameters:
- `networkInput` (optional): A string or null, either `"testnet"` or `""`. Default is `"bitcoin"`.

#### Returns:
  - `{ p2pkhAddress, wif }`: Object
  - `p2pkhAddress`: The legacy Bitcoin address.
  - `wif`: The Wallet Import Format (WIF) private key.

#### Example:
```javascript
// Vanilla JavaScript in the Browser:
const { p2pkh, wif } = await BTC.createLegacyWallet('testnet');
console.log({ p2pkh, wif });
```

```typescript
// Typescript:
import { BTC, Network } from 'bitcoinjs-lib-wrapper';
const networkInput: Network = 'testnet';
const { p2pkh, wif } = await BTC.createLegacyWallet(networkInput);
console.log({ p2pkh, wif });
```

---

## Additional Functions

- **`getWalletFromWif(wif, [networkInput])`**: Retrieve a wallet from a WIF.
- **`getAdressFromXpub(xpub, acctNumber, keyindex, type)`**: Get an address from an extended public key (xpub).
- **`getXpubFromSeed(seed, deriv, account)`**: Get an xpub from a seed.
- **`getNewMultisigWallet(m, n, [networkInput])`**: Create a new multisig wallet.
- **`spendFromP2SHP2WPKH(...)`**: Spend from P2SH-P2WPKH address.

---

## License
The BitcoinJS Library Wrapper is open-source and distributed under the MIT license.

---

This documentation covers the primary functions of the library. It can be extended as more functions or features are added to the library:

### 1. **Library Structure**

It uses several dependencies such as `bitcoinjs-lib`, `bip38`, `bip39`, `bip65`, among others, for handling keys, addresses, and transactions in the Bitcoin protocol. Here are some of the most important concepts and functions:

### 2. **Wallet Creation**

The library provides several functions to create Bitcoin wallets of different types:

- **`createLegacyWallet('bitcoin'||'testnet')`**: Creates a P2PKH (Pay-to-PubKeyHash) wallet, also known as a legacy address. This type of address starts with "1" (on mainnet).
  - Generates a private key (WIF - Wallet Import Format) and a corresponding address.
  
- **`createBech32Wallet()`**: Generates a **Bech32** or **P2WPKH** (native SegWit) wallet, whose addresses start with "bc1" (on mainnet) and have better transaction size efficiency.

These functions allow generating different addresses, with private keys in compatible formats for different types of transactions.

### 3. **HD Wallets (Hierarchical Deterministic)**

The library implements HD wallet functionalities based on the **BIP32** standard, where all keys and addresses are derived from a *seed*.

- **`createHDWallet(seed, deriv, account, change, index, 'bitcoin'||'testnet')`**: Derives a wallet from an HD *seed* using parameters such as the derivation path, account number, whether it's for change or receiving, and the address index.
  
  - **Seed**: The *seed* is generated from a mnemonic phrase and converted into a hexadecimal sequence.
  - **Deriv**: The `deriv` parameter is the "derivation path," which defines the address type (44' for P2PKH, 84' for Bech32).
  - **Account, Change, and Index**: Following the BIP44 standard, these variables define the hierarchical structure of the keys.
  
  This function generates a new address based on the provided derivation path.

### 4. **Mnemonic Phrase and Seed (BIP39)**

The library uses the **BIP39** standard for generating and verifying mnemonic phrases:

- **`createMnemonic()`**: Generates a new mnemonic phrase, used to create an HD Wallet.
- **`verifyMnemonic(mnemonic)`**: Verifies if a mnemonic phrase is valid according to the BIP39 standard.
- **`createSeedHexFromMnemonic(mnemonic)`**: Converts a mnemonic phrase into a hexadecimal *seed*, which will be used to derive keys and addresses.

### 5. **Address Validation and Conversion**

- **`isValidAddress(address, 'bitcoin'||'testnet')`**: Checks if the provided Bitcoin address is valid, considering the network type (mainnet or testnet).
  
### 6. **Transactions**

The library offers several functions to create and sign transactions:

- **`spendFromLegacy(txid, out, address, amount, wif, changeAddress, changeAmount, 'bitcoin'||'testnet')`**: Generates a transaction to spend funds from a P2PKH address, signing with the provided private key in WIF format.

- **`spendFromBech32(txid, out, address, amount, wif, changeAddress, changeAmount, balance, 'bitcoin'||'testnet')`**: Generates and signs a native SegWit (Bech32) transaction from a P2WPKH address.

These functions use **inputs** (outputs from previous transactions) and **outputs** (destination addresses and amounts) to construct a transaction. The **WIF** (private key) is used to sign the transaction, ensuring that only the private key owner can move the funds.

> future versions will include Array<inputs> and Array<outputs>. As up until now, only offers one input and two outputs

### 8. **Locking Scripts and Multisig**

The library also implements advanced script functionalities:

- **`getLockTimeWalletFromWIF(privateKey, locktime, networkInput)`**: Creates a time-locked wallet using a CLTV (Check Lock Time Verify) script. This type of wallet allows funds to be locked until a specific future date.

### Summary of Key Concepts

- **HD Wallet**: The library implements the hierarchical deterministic wallet structure with support for different derivation path types.
- **SegWit**: Supports SegWit (P2SH and native Bech32), improving efficiency and reducing transaction fees.
- **Multisig**: Implements multisig wallets, allowing transactions to be signed by multiple parties.
- **Transactions**: Generates, constructs, and signs transactions of different address types.
- **BIP39**: Uses mnemonic phrases and seeds according to the BIP39 standard, facilitating wallet backup and recovery.

The library is quite robust, providing a comprehensive solution for creating and managing Bitcoin wallets with security and flexibility.