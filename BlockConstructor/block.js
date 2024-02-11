const fs = require('fs')

const readMempoolFile = (filename) => {

 const data = fs.readFileSync(filename,'utf-8');
 const transactions = {}
 const content = data.split('\n').map((item) => item.trim())

 content.forEach((line) => {
   const [txid, fee, weight, parentTxids] = line.split(',')
   
   transactions[txid] = { 
     fee: Number(fee),
     weight: Number(weight),
     parents: parentTxids ? new Set(parentTxids.split(',')) : null,
   }
 })

  return transactions
}

const getMaxFee = (transactions, validTransactions) => {

  let maxTransactionFee = null;

  
  for(const [txid, data] of Object.entries(transactions)){
      
    if(!validTransactions.has(txid)){

      const parentData = data.parents ? [...data.parents].every((parent) => 
        validTransactions.has(parent)) : true
      if((parentData) && (maxTransactionFee === null || data.fee > transactions[maxTransactionFee].fee)){
          maxTransactionFee = txid
         
      }
    }
  }
  //console.log(maxTransactionFee)
  return maxTransactionFee;
}


const validBlock = (filename) => {
  const data = readMempoolFile(filename)

  const validTransactions = new Set()

  let transactionBlocks = []
  let newTransactionMaxFee = ''

  do{
    newTransactionMaxFee = getMaxFee(data, validTransactions)
    //console.log(newTransactionMaxFee)

    if(newTransactionMaxFee){
      validTransactions.add(newTransactionMaxFee)
      transactionBlocks.push(newTransactionMaxFee)
    }

  }
  while(newTransactionMaxFee)
  transactionBlocks = transactionBlocks.filter((value) => data[value].parents !== null)
    
  return transactionBlocks
}

function sortMempool(param) {
 const result = validBlock(param)
const output = fs.writeFileSync('./block_sample.txt', result.join('\n'))
 return result
}
const filename = './mempool.csv'
sortMempool(filename)
//console.log(sortMempool(filename));