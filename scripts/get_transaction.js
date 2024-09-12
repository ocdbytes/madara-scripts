const starknet = require("starknet");

const provider = new starknet.RpcProvider({
  nodeUrl: "http://localhost:9944",
});

async function main(txnHash) {
  const result = await provider.getTransactionReceipt(txnHash);
  const resultString = JSON.stringify(result, null, 2);

  console.log("This is the transaction receipt - ", resultString);

  // Print the keys and data of each event
  if (result.events) {
    result.events.forEach((event, index) => {
      console.log(`Event ${index} keys:`, event.keys);
      console.log(`Event ${index} data:`, event.data);
    });
  } else {
    console.log("No events found in the transaction receipt.");
  }
}

main(process.argv[2]);
