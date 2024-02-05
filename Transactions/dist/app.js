"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const bip32_1 = __importDefault(require("bip32"));
const ecc = __importStar(require("tiny-secp256k1"));
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = (0, bip32_1.default)(ecc);
const TESTNET = bitcoinjs_lib_1.networks.testnet;
const preimage = "Btrust Builders";
const encodePreimage = "427472757374204275696c64657273";
const lock_hex = encodePreimage;
const redeemScriptHex = `OP_SHA256 ${lock_hex} OP_EQUAL`;
const redeemScript = bitcoinjs_lib_1.script.fromASM(redeemScriptHex);
const scriptPubKey = bitcoinjs_lib_1.payments.p2sh({ redeem: { output: redeemScript } });
const address = scriptPubKey.address;
console.log('Redeem Script', redeemScriptHex);
console.log("address ", address);
// Define the transaction inputs
const utxos = [
    {
        txid: 'txid1',
        vout: 0,
        value: 5000000,
        scriptPubKey: 'scriptPubKey1' // Replace with the actual scriptPubKey
    },
    {
        txid: 'txid2',
        vout: 0,
        value: 7000000,
        scriptPubKey: 'scriptPubKey2' // Replace with the actual scriptPubKey
    }
];
// Define the transaction outputs
const outputs = [
    {
        address: `${address}`,
        value: 10000000
    }
];
// Define the extended private key
const extendedPrivateKey = 'xprvXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
// Create a new partially signed transaction (Psbt)
const psbt = new bitcoinjs_lib_1.Psbt({ network: TESTNET });
// Add each UTXO as an input to the Psbt
for (const utxo of utxos) {
    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
            script: utxo.scriptPubKey ? Buffer.from(utxo.scriptPubKey, 'hex') : Buffer.alloc(0),
            value: utxo.value
        },
    });
}
// Add each output to the Psbt 
for (const output of outputs) {
    psbt.addOutput({
        address: output.address,
        value: output.value,
    });
}
// Derive the private key for each input using the extended private key and sign
for (let i = 0; i < utxos.length; i++) {
    const key = bip32.fromBase58(extendedPrivateKey, TESTNET).derivePath(`m/0/${i}`).privateKey;
    psbt.signInput(i, key);
}
// Finalize the Psbt
psbt.finalizeAllInputs();
// Build the transaction and print it
const tx = psbt.extractTransaction();
console.log(tx.toHex());
