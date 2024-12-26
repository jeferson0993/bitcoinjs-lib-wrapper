/**
 * This JavaScript file is the core implementation of the `bitcoinjs-lib-wrapper` library, which provides a simplified interface
 * for interacting with Bitcoin through the `bitcoinjs-lib v3`. The library offers a range of functions to create and manage Bitcoin
 * wallets, validate addresses, handle mnemonics, and construct Bitcoin transactions. It supports various Bitcoin address types,
 * including Legacy (P2PKH), Segwit (P2SH-P2WPKH), and Bech32 (P2WPKH), and includes functionality for working with HD wallets
 * and multisig wallets. The file contains detailed function definitions with parameters, return types, and usage examples,
 * making it easier for developers to integrate Bitcoin functionalities into their applications.
 */

let bitcoin = require("bitcoinjs-lib");
bitcoin.bigi = require("bigi");
bitcoin.Buffer = require("safe-buffer").Buffer;
let bip38 = require("bip38");
bip38.wifEnc = require("wif");
let bip39 = require("bip39");

/**
 * Gets the selected network based on the input.
 *
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 */
const getSelectedNetwork = (networkInput) => {
  switch (networkInput) {
    case "testnet":
      return bitcoin.networks.testnet;
    default:
      return bitcoin.networks.bitcoin;
  }
};

/**
 * Creates a new random P2PKH (Legacy) wallet.
 *
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 * @returns {Object} - An object containing the following properties:
 *  - privateKey: The private key of the wallet.
 *  - wif: The Wallet Import Format (WIF) of the wallet.
 *  - address: The P2PKH address of the wallet.
 */
const createPayToPublicKeyHashWallet = async (networkInput) => {
  const network = getSelectedNetwork(networkInput);
  const wif = bitcoin.ECPair.makeRandom({ network }).toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(wif, network);
  const p2pkh = await keyPair.getAddress();

  return { p2pkh, wif };
};

/**
 * Creates a new random P2PKH (Legacy) wallet.
 *
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 * @returns {Object} - An object containing the following properties:
 *  - privateKey: The private key of the wallet.
 *  - wif: The Wallet Import Format (WIF) of the wallet.
 *  - address: The P2PKH address of the wallet.
 */
const createLegacyWallet = async (networkInput) =>
  await createPayToPublicKeyHashWallet(networkInput);

/**
 * Creates a new P2WPKH (bech32) wallet with a new private key.
 *
 * @param {Network} network - The network input can be either "testnet" or "bitcoin".
 * If not pass a network as a paramiter, the default network wil be "bitcoin".
 * @returns {Object} - An object containing the new P2WPKH wallet's address and the corresponding WIF.
 * { p2wpkh, wif }
 */
const createPayToWitnessPublicKeyHash = async (networkInput) => {
  const network = getSelectedNetwork(networkInput);
  const wif = bitcoin.ECPair.makeRandom({ network }).toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(wif, network);
  const pubKey = await keyPair.getPublicKeyBuffer();
  const pubKeyHash = bitcoin.crypto.hash160(pubKey);
  const witnessPubKeyHash =
    await bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
  const p2wpkh = await bitcoin.address.fromOutputScript(
    witnessPubKeyHash,
    network,
  );

  return { p2wpkh, wif };
};

/**
 * Creates a new P2WPKH (bech32) wallet with a new private key.
 *
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 * If not pass a network as a paramiter, the default network wil be "bitcoin".
 * @returns {Object} - An object containing the new P2WPKH wallet's address and the corresponding WIF.
 * { p2wpkh, wif }
 */
const createBech32Wallet = async (networkInput) =>
  await createPayToWitnessPublicKeyHash(networkInput);

/**
 * Creates a new P2SHP2WPKH (segwit) wallet with a new private key.
 *
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 * If not pass a network as a paramiter, the default network wil be "bitcoin".
 * @returns {Object} - An object containing the new P2SHP2WPKH wallet's address and the corresponding WIF.
 * { p2shp2wpkh, wif }
 */
const createPayToScriptHash_PayToWitnessPublicKeyHash = async (
  networkInput,
) => {
  const network = getSelectedNetwork(networkInput);
  const wif = bitcoin.ECPair.makeRandom({ network }).toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(wif, network);
  const pubKey = await keyPair.getPublicKeyBuffer();
  const pubKeyHash = bitcoin.crypto.hash160(pubKey);
  const witnessPubKeyHash =
    await bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
  const witnessPubKeyHashHex = await witnessPubKeyHash.toString("hex");
  const witnessPubKeyHashHexHash = bitcoin.crypto.hash160(witnessPubKeyHashHex);
  const scriptHash = await bitcoin.script.scriptHash.output.encode(
    witnessPubKeyHashHexHash,
  );
  const p2shp2wpkh = await bitcoin.address.fromOutputScript(
    scriptHash,
    network,
  );

  return { p2shp2wpkh, witnessPubKeyHashHex, wif };
};

/**
 * Creates a new P2SHP2WPKH (segwit) wallet with a new private key.
 *
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 * If not pass a network as a paramiter, the default network wil be "bitcoin".
 * @returns {Object} - An object containing the new P2SHP2WPKH wallet's address and the corresponding WIF.
 * { p2shp2wpkh, wif }
 */
const createSegwitWallet = async (networkInput) =>
  await createPayToScriptHash_PayToWitnessPublicKeyHash(networkInput);

/**
 *
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 * If not pass a network as a paramiter, the default network wil be "bitcoin".
 * @returns {Object} - An object containing the wallet's address and the corresponding WIF.
 * { p2pkh, p2wpkh, p2shp2wpkh, wif, p2shp2wpkhRedeemScriptHex }
 */
const createWallets = async (networkInput) => {
  const network = getSelectedNetwork(networkInput);
  const wif = bitcoin.ECPair.makeRandom({ network }).toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(wif, network);

  //p2pkh
  const p2pkh = await keyPair.getAddress();

  //native witness
  const pubKey = await keyPair.getPublicKeyBuffer();
  const pubKeyHash = bitcoin.crypto.hash160(pubKey);
  const witnessPubKeyHash =
    await bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
  const p2wpkh = await bitcoin.address.fromOutputScript(
    witnessPubKeyHash,
    network,
  );

  //p2sh witness
  const witnessPubKeyHashHex = await witnessPubKeyHash.toString("hex");
  const witnessPubKeyHashHexHash = bitcoin.crypto.hash160(witnessPubKeyHashHex);
  const scriptHash = await bitcoin.script.scriptHash.output.encode(
    witnessPubKeyHashHexHash,
  );
  const p2shp2wpkh = await bitcoin.address.fromOutputScript(
    scriptHash,
    network,
  );

  return { wif, p2pkh, p2wpkh, p2shp2wpkh, witnessPubKeyHashHex };
};

/**
 *
 * @param {*} wif
 * @param {string} networkInput - The network input can be either 'testnet', 'regtest', or 'bitcoin'.
 * If not pass a network as a paramiter, the default network wil be "bitcoin".
 * @returns {Object} - An object containing the wallet's address and the corresponding WIF.
 * { p2pkh, p2wpkh, p2shp2wpkh, wif, p2shp2wpkhRedeemScriptHex }
 */
const createWalletsFromWIF = async (wif, networkInput) => {
  const network = getSelectedNetwork(networkInput);
  const keyPair = bitcoin.ECPair.fromWIF(wif, network);

  //p2pkh
  const p2pkh = await keyPair.getAddress();

  //native witness
  const pubKey = await keyPair.getPublicKeyBuffer();
  const pubKeyHash = bitcoin.crypto.hash160(pubKey);
  const witnessPubKeyHash =
    await bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
  const p2wpkh = await bitcoin.address.fromOutputScript(
    witnessPubKeyHash,
    network,
  );

  //p2sh witness
  const witnessPubKeyHashHex = await witnessPubKeyHash.toString("hex");
  const witnessPubKeyHashHexHash = bitcoin.crypto.hash160(witnessPubKeyHashHex);
  const scriptHash = await bitcoin.script.scriptHash.output.encode(
    witnessPubKeyHashHexHash,
  );
  const p2shp2wpkh = await bitcoin.address.fromOutputScript(
    scriptHash,
    network,
  );

  return { wif, p2pkh, p2wpkh, p2shp2wpkh, witnessPubKeyHashHex };
};

/**
 *
 * @param {string} address
 * @param {string} networkInput
 * @returns {boolean}
 */
const isValidAddress = async (address, networkInput) => {
  const network = getSelectedNetwork(networkInput);
  try {
    await bitcoin.address.toOutputScript(address, network);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

/**
 *
 * @param {string} seed
 * @param {number} purpose
 * @param {number} account
 * @param {number} receivingOrChange
 * @param {number} index
 * @param {string} networkInput
 * @returns
 */
const createHierarchicalDeterministic = async (
  seed,
  purpose = 44,
  account = 0,
  receivingOrChange = 0,
  index = 0,
  networkInput,
) => {
  const network = getSelectedNetwork(networkInput);
  const netPath = networkInput === "testnet" ? 1 : 0;
  const node = bitcoin.HDNode.fromSeedHex(seed, network);
  // purpose' / netPath' / account' / receiving or change / index
  const path = `m/${purpose}'/${netPath}'/${account}'/${receivingOrChange}/${index}`;
  const keyPair = await node.derivePath(path).keyPair;
  const wif = await keyPair.toWIF();
  const publicKey = await keyPair.getPublicKeyBuffer();
  const pubKeyHash = bitcoin.crypto.hash160(publicKey);
  const witnessPubKeyHash =
    await bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);

  switch (purpose) {
    case 84: {
      const p2wpkh = await bitcoin.address.fromOutputScript(
        witnessPubKeyHash,
        network,
      );
      return { p2wpkh, wif };
    }

    case 49: {
      const witnessPubKeyHashHex = await witnessPubKeyHash.toString("hex");
      const witnessPubKeyHashHexHash =
        bitcoin.crypto.hash160(witnessPubKeyHashHex);
      const scriptHash = await bitcoin.script.scriptHash.output.encode(
        witnessPubKeyHashHexHash,
      );
      const p2shp2wpkh = await bitcoin.address.fromOutputScript(
        scriptHash,
        network,
      );

      return {
        p2shp2wpkh,
        wif,
        witnessPubKeyHashHex,
      };
    }

    default: {
      const p2pkh = await keyPair.getAddress();
      return { p2pkh, wif };
    }
  }
};

/**
 *
 * @param {string} seed
 * @param {number} purpose
 * @param {number} account
 * @param {number} receivingOrChange
 * @param {number} index
 * @param {string} networkInput
 * @returns
 */
const createHDWallet = async (
  seed,
  purpose = 44,
  account = 0,
  receivingOrChange = 0,
  index = 0,
  networkInput,
) =>
  await createHierarchicalDeterministic(
    seed,
    purpose,
    account,
    receivingOrChange,
    index,
    networkInput,
  );

/**
 *
 * @returns {object} - { mnemonic: string }
 */
const createMnemonic = () => {
  const mnemonic = bip39.generateMnemonic();
  return { mnemonic };
};

/**
 *
 * @param {string} mnemonicInput
 * @returns {object} - { seedHex: string }
 */
const createSeedHexFromMnemonic = (mnemonicInput) => {
  const seedHex = bip39.mnemonicToSeedSync(mnemonicInput).toString("hex");
  return { seedHex };
};

/**
 *
 * @param {string} entropySrc
 * @returns
 */
const createMnemonicFromEntropy = async (entropySrc) => {
  const mnemonic = await bip39.entropyToMnemonic(entropySrc);
  return { mnemonic };
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
const spendFromP2PKH = async (
  txId,
  out,
  address,
  amount,
  wif,
  changeAddress,
  changeAmount,
  networkInput,
) => {
  const network = getSelectedNetwork(networkInput);
  console.log({
    txId,
    out,
    address,
    amount,
    wif,
    changeAddress,
    changeAmount,
    networkInput,
  });
  //legacy address starts with a 1
  //create transaction
  const transactionBuilder = new bitcoin.TransactionBuilder(network);

  //input
  transactionBuilder.addInput(txId, out);

  //check for output
  if (isValidAddress(address, networkInput)) {
    transactionBuilder.addOutput(address, amount);
  } else {
    throw new Error("invalid address");
  }

  //check for change output
  if (isValidAddress(changeAddress, networkInput)) {
    transactionBuilder.addOutput(changeAddress, changeAmount);
  } else {
    throw new Error("invalid change address");
  }

  //sign transaction
  const keypairSpend = bitcoin.ECPair.fromWIF(wif, network);
  transactionBuilder.sign(0, keypairSpend);

  //build transaction
  const transaction = transactionBuilder.build();
  const txHex = await transaction.toHex();

  return { txHex };
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
const spendFromLegacy = async (
  txId,
  out,
  address,
  amount,
  wif,
  changeAddress,
  changeAmount,
  networkInput,
) =>
  await spendFromP2PKH(
    txId,
    out,
    address,
    amount,
    wif,
    changeAddress,
    changeAmount,
    networkInput,
  );

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
const spendFromP2WPKH = async (
  txId,
  out,
  address,
  amount,
  wif,
  changeAddress,
  changeAmount,
  balance,
  networkInput,
) => {
  const network = getSelectedNetwork(networkInput);
  console.log({
    txId,
    out,
    address,
    amount,
    wif,
    changeAddress,
    changeAmount,
    balance,
    networkInput,
  });
  //bech32 native segwit
  //create transaction
  const transactionBuilder = new bitcoin.TransactionBuilder(network);

  //need scriptPubKey for adding input
  //private key of p2sh-p2wpkh output
  const keyPair = bitcoin.ECPair.fromWIF(wif, network);
  const publicKey = await keyPair.getPublicKeyBuffer();
  const pubKeyHash = bitcoin.crypto.hash160(publicKey);
  const witnessPubKeyHash =
    await bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
  // const scriptPubkey = await bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer()));

  //add input
  transactionBuilder.addInput(txId, out, null, witnessPubKeyHash);

  //check for output
  if (isValidAddress(address, networkInput)) {
    transactionBuilder.addOutput(address, amount);
  } else {
    throw new Error("invalid address");
  }

  //check for change output
  if (isValidAddress(changeAddress, networkInput)) {
    transactionBuilder.addOutput(changeAddress, changeAmount);
  } else {
    throw new Error("invalid change address");
  }

  //sign transaction
  transactionBuilder.sign(0, keyPair, null, null, balance);

  //build transaction
  const transaction = transactionBuilder.build();
  const txHex = await transaction.toHex();
  return { txHex };
};

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
const spendFromBech32 = async (
  txId,
  out,
  address,
  amount,
  wif,
  changeAddress,
  changeAmount,
  balance,
  networkInput,
) =>
  await spendFromP2WPKH(
    txId,
    out,
    address,
    amount,
    wif,
    changeAddress,
    changeAmount,
    balance,
    networkInput,
  );

module.exports = {
  createLegacyWallet,
  createPayToPublicKeyHashWallet,
  createBech32Wallet,
  createPayToWitnessPublicKeyHash,
  createSegwitWallet,
  createPayToScriptHash_PayToWitnessPublicKeyHash,
  createWallets,
  createWalletsFromWIF,
  createHDWallet,
  createHierarchicalDeterministic,

  isValidAddress,

  createMnemonic,
  createSeedHexFromMnemonic,
  createMnemonicFromEntropy,

  spendFromLegacy,
  spendFromP2PKH,

  spendFromBech32,
  spendFromP2WPKH,
  bitcoin,
};
