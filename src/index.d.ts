/**
 * This TypeScript declaration file defines the interfaces and functions provided by the `bitcoinjs-lib-wrapper` library.
 * The library serves as a wrapper around `bitcoinjs-lib`, offering simplified methods for creating and managing Bitcoin wallets,
 * validating addresses, handling mnemonics, and constructing Bitcoin transactions. It supports various Bitcoin address types,
 * including P2PKH, P2WPKH, and P2SH-P2WPKH, and provides functionality for working with HD wallets and multisig wallets.
 * The file includes type definitions for wallets, multisig wallets, and derivation paths, as well as detailed documentation
 * for each function, specifying parameters, return types, and usage examples.
 */

/**
 * Represents a Bitcoin wallet with various address types and associated information.
 */
export declare interface Wallet {
  /**
   * The Wallet Import Format (WIF) private key for the wallet.
   */
  wif: string;

  /**
   * The Pay-to-Public-Key-Hash (P2PKH) address associated with the wallet.
   */
  p2pkh?: string;

  /**
   * The Pay-to-Witness-Public-Key-Hash (P2WPKH) address associated with the wallet.
   */
  p2wpkh?: string;

  /**
   * The Pay-to-Script-Hash nested Pay-to-Witness-Public-Key-Hash (P2SH-P2WPKH) address associated with the wallet.
   */
  p2shp2wpkh?: string;

  /**
   * The hexadecimal representation of the redeem script for the P2SH-P2WPKH address.
   */
  witnessPubKeyHashHex?: string;
}

/**
 * Represents the network type for Bitcoin operations.
 *
 * @typedef Network
 * @description This type is used to specify the network on which Bitcoin operations are performed.
 *
 * @remarks
 * - 'testnet': Represents the Bitcoin test network, used for testing and development.
 * - 'bitcoin': Represents the main Bitcoin network, used for real transactions.
 */
export declare type Network = "testnet" | "bitcoin";

/**
 * Represents the derivation path for different types of Bitcoin addresses.
 *
 * @typedef {(44 | 49 | 84 )} DerivationPath
 * @description This type is used to specify the derivation path for generating Bitcoin addresses:
 * - 44: Represents the legacy P2PKH address type (BIP44)
 * - 49: Represents the SegWit P2SH-P2WPKH address type (BIP49)
 * - 84: Represents the native SegWit (bech32) P2WPKH address type (BIP84)
 */
export declare type DerivationPath = 44 | 49 | 84;

declare module "bitcoinjs-lib-wrapper" {
  export namespace BTC {
    /**
     * Creates a new P2PKH (Legacy) wallet with a new private key.
     *
     * @param {Network} network - The network input can be either "testnet" or "bitcoin".
     * If not pass a network as a paramiter, the default network wil be "bitcoin".
     * @returns {Object} - An object containing the new P2PKH wallet's address and the corresponding WIF.
     * { p2pkhAddress, wif }
     */
    export function createLegacyWallet(network?: Network): Promise<Wallet>;

    /**
     * Creates a new P2WPKH (bech32) wallet with a new private key.
     *
     * @param {Network} network - The network input can be either "testnet" or "bitcoin".
     * If not pass a network as a paramiter, the default network wil be "bitcoin".
     * @returns {Object} - An object containing the new P2WPKH wallet's address and the corresponding WIF.
     * { p2wpkhAddress, wif }
     */
    export function createBech32Wallet(network?: Network): Promise<Wallet>;

    /**
     * Creates a new P2SHP2WPKH (segwit) wallet with a new private key.
     *
     * @param {Network} network - The network input can be either "testnet" or "bitcoin".
     * If not pass a network as a paramiter, the default network wil be "bitcoin".
     * @returns {Object} - An object containing the new P2SHP2WPKH wallet's address and the corresponding WIF.
     * { p2shp2wpkhAddress, wif }
     */
    export function createSegwitWallet(network?: Network): Promise<Wallet>;

    /**
     * Gets a new wallet containing Legacy, Segwit and Bech32 addresses with a new private key.
     *
     * @param {string} wif - The private key.
     * @param {Network} network - The network input can be either "testnet" or "bitcoin".
     * If not pass a network as a paramiter, the default network wil be "bitcoin".
     * @returns {Object} - An object containing the new wallet's addresses and the corresponding WIF.
     * { p2pkhAddress, p2wpkhAddress, p2shp2wpkhAddress, redeemScriptHex, wif }
     */
    export function createWalletsFromWIF(
      wif: string,
      network?: Network,
    ): Promise<Wallet>;

    /**
     * Creates a new Wallet containing Legacy, Segwit and Bech32 addresses with a new private key.
     *
     * @param {Network} network - The network input can be either "testnet" or "bitcoin".
     * If not pass a network as a paramiter, the default network wil be "bitcoin".
     * @returns {Object} - An object containing the new wallet's addresses and the corresponding WIF.
     * { p2pkhAddress, p2shp2wpkhAddress, p2wpkhAddress, wif }
     */
    export function createWallets(network?: Network): Promise<Wallet>;

    /**
     * Checks if the provided address is a valid Bitcoin address.
     *
     * @param {string} address - The address to be validated.
     * @param {Network} network - 'testnet' | 'bitcoin'
     * @returns {boolean} - Returns true if the address is valid, false otherwise.
     */
    export function isValidAddress(address: string, network?: Network): boolean;

    /**
     * Get Wallet from HD Seed Phrase
     * @param {string} seed
     * @param {DerivationPath} deriv - 44 | 49 | 84
     * @param {number} account
     * @param {number} receivingOrChange
     * @param {number} index
     * @param {Network} network - 'testnet' | 'bitcoin'
     * @returns - { address, wif, redeemScriptHex | undefined }
     */
    export function createHDWallet(
      seed: string,
      deriv: DerivationPath,
      account: number,
      receivingOrChange: number,
      index: number,
      network?: Network,
    ): Promise<Wallet>;

    /**
     * Generates a new mnemonic phrase according to BIP39 standards.
     *
     * @returns {string} - An object containing the generated mnemonic phrase.
     */
    export function createMnemonic(): { mnemonic: string };

    /**
     * Generates a seed hex string from the provided mnemonic phrase according to BIP39 standards.
     *
     * @param {string} mnemonic - The mnemonic phrase to be converted.
     * @returns { seedHex: string }  - A seed hex string.
     */
    export function createSeedHexFromMnemonic(mnemonic: string): {
      seedHex: string;
    };

    /** txId, out, address, amount, wif, changeAddress, changeAmount, networkInput
     * Spends the funds from a P2PKH wallet.
     *
     * @param {string} txId - the transaction ID.
     * @param {number} out - output index.
     * @param {string} address - the destination address.
     * @param {number} amount - the amount to send.
     * @param {string} wif - The private key of the wallet in WIF format.
     * @param {string} changeAddress - The address to send the change amount to.
     * @param {number} changeAmount - The amount of change to send.
     * @param {string} networkInput - The network input can be either "testnet" or "bitcoin".
     * If not pass a network as a paramater, the default network wil be "bitcoin".
     * @returns {Object} - An object containing the hexadecimal representation of the transaction.
     * {
     *   txhex: <string> // The hexadecimal representation of the transaction
     * }
     */
    export function spendFromLegacy(
      txId: string,
      out: number,
      address: string,
      amount: number,
      wif: string,
      changeAddress: string,
      changeAmount: number,
      networkInput: Network,
    ): Promise<{ txHex: string }>;
  }

  /**
   * Spends the funds from a P2WPKH wallet.
   *
   * @param {string} txId - the transaction ID.
   * @param {number} out - output index.
   * @param {string} address - the destination address.
   * @param {number} amount - the amount to send.
   * @param {string} wif - The private key of the wallet in WIF format.
   * @param {string} changeAddress - The address to send the change amount to.
   * @param {number} changeAmount - The amount of change to send.
   * @param {number} balance - The balance available.
   * @param {string} networkInput - The network input can be either "testnet" or "bitcoin".
   * If not pass a network as a parameter, the default network wil be "bitcoin".
   * @returns {Object} - An object containing the hexadecimal representation of the transaction.
   * {
   *   txhex: <string> // The hexadecimal representation of the transaction
   * }
   */
  export function spendFromBech32(
    txId: string,
    out: number,
    address: string,
    amount: number,
    wif: string,
    changeAddress: string,
    changeAmount: number,
    balance: number,
    networkInput: Network,
  ): Promise<{ txHex: string }>;
}
