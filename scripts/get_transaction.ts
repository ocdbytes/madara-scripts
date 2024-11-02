import { RpcProvider } from "starknet";
import { L2_RPC_URL } from "./constants";

const provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

async function main(txnHash: string) {
  const result = await provider.getTransactionReceipt(txnHash);
  const resultString = JSON.stringify(result, null, 2);

  console.log("This is the transaction receipt - ", resultString);

  // Print the keys and data of each event
  if (isReceiptWithEvents(result)) {
    result.events.forEach((event: { keys: any; data: any }, index: number) => {
      console.log(`Event ${index} keys:`, event.keys);
      console.log(`Event ${index} data:`, event.data);
    });
  } else {
    console.log("No events found in the transaction receipt.");
  }
}

main(process.argv[2]);

// Type guard to check if the receipt contains events
function isReceiptWithEvents(
  receipt: any
): receipt is { events: { keys: any; data: any }[] } {
  return receipt && Array.isArray(receipt.events);
}
