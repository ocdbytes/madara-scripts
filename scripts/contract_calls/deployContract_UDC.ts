import {
  Account,
  RpcProvider,
  hash,
  CallData,
  Contract,
  num,
  json,
  byteArray,
  cairo,
} from "starknet";
import { readFileSync } from "fs";
import {
  ACCOUNT_0_ADDRESS,
  ACCOUNT_0_PK,
  ERC20_CONTRACT_CLASS_HASH,
  L2_RPC_URL,
  UDC_ADDRESS,
} from "../constants";

const provider = new RpcProvider({
  nodeUrl: L2_RPC_URL,
});

const account_0_address = ACCOUNT_0_ADDRESS;
const account_0_pk = ACCOUNT_0_PK;

const account = new Account(provider, account_0_address, account_0_pk);

const json_sierra_data = readFileSync(
  __dirname + "/../../contracts/UDC.json",
  "utf8"
);

const compiledUDCSierra = json.parse(json_sierra_data);

async function main() {
  let udc_contract = new Contract(compiledUDCSierra.abi, UDC_ADDRESS, account);

  let populated_txn = udc_contract.populate("deployContract", [
    ERC20_CONTRACT_CLASS_HASH,
    "1234567890abc",
    false,
    CallData.compile({
      name: byteArray.byteArrayFromString("zkSTRK"),
      symbol: byteArray.byteArrayFromString("zkSTRK"),
      fixed_supply: cairo.uint256(100 * 10 ** 18),
      recipient: account_0_address,
      owner: account_0_address,
    }),
  ]);

  let res = await account.execute(populated_txn, {
    nonce: await provider.getNonceForAddress(account_0_address),
    maxFee: "2870302852309280000",
  });

  console.log(">>>>> res : ", res);

  await provider.waitForTransaction(res.transaction_hash);
  let txn_r = await provider.getTransactionReceipt(res.transaction_hash);
  console.log("Txn hash - ", txn_r);
  console.log("Contract Deployed...");

  let events = await provider.getEvents({
    from_block: { block_number: 0 },
    to_block: {
      block_number: (await provider.getBlock("latest")).block_number,
    },
    chunk_size: 100,
    address: UDC_ADDRESS,
  });

  console.log(">>>> events : ", events.events);
}

main();
