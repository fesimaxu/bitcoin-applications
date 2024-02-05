import bitcoin, { networks, script, payments, Psbt } from "bitcoinjs-lib";
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc);

const TESTNET = networks.testnet;

const preimage = "Btrust Builders";

const encodePreimage = "427472757374204275696c64657273";
const lock_hex = encodePreimage;

const redeemScriptHex = `OP_SHA256 ${lock_hex} OP_EQUAL`;

const redeemScript = script.fromASM(redeemScriptHex);
const scriptPubKey = payments.p2sh({ redeem: { output: redeemScript } });
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
const psbt = new Psbt({ network: TESTNET });

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
    const key: any = bip32.fromBase58(extendedPrivateKey, TESTNET).derivePath(`m/0/${i}`).privateKey;
    psbt.signInput(i, key);
}

// Finalize the Psbt
psbt.finalizeAllInputs();

// Build the transaction and print it
const tx = psbt.extractTransaction();
console.log(tx.toHex());
