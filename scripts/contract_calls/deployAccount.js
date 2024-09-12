import { Account, RpcProvider, hash, CallData, Contract, json } from "starknet";
import { readFileSync } from "fs";

const provider = new RpcProvider({
  nodeUrl: "http://localhost:9944",
});

const account_0_address =
  "0x44bd8470d4cf664f8b76e1f510e3b2d4ff6c35e8c044478c3068537c9631e74";
const account_0_pk =
  "0x368149220677b8e6354cf68c31cbea47edb92a8780121f204bb530cf7cde2c7";

const account = new Account(provider, account_0_address, account_0_pk);

const json_data = readFileSync(
  "/Users/ocdbytes/Karnot/testing_madara_scripts/contracts/ERC20.sierra.json",
  "utf8"
);

const contract_eth = new Contract(
  json.parse(json_data).abi,
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  provider
);
const contract_strk = new Contract(
  json.parse(json_data).abi,
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  provider
);

async function transfer_funds(contractAddress) {
  let hash_0 = await account.execute(
    contract_eth.populate("transfer", [
      contractAddress,
      "100000000000000000000",
    ]),
    {
      nonce: 0,
      maxFee: "2870302852309280000",
    }
  );

  console.log("Txn hash - ", hash_0);
  await provider.waitForTransaction(hash_0.transaction_hash);

  let hash_1 = await account.execute(
    contract_strk.populate("transfer", [
      contractAddress,
      "100000000000000000000",
    ]),
    {
      nonce: 1,
      maxFee: "2870302852309280000",
    }
  );

  console.log("Txn hash - ", hash_1);
  await provider.waitForTransaction(hash_1.transaction_hash);

  console.log(
    ">>> balance_sender_final [ETH]",
    await contract_eth.balanceOf(account_0_address)
  );
  console.log(
    ">>> balance_reciever_final [ETH]",
    await contract_eth.balanceOf(contractAddress)
  );
  console.log(
    ">>> balance_sender_final [STRK]",
    await contract_strk.balanceOf(account_0_address)
  );
  console.log(
    ">>> balance_reciever_final [STRK]",
    await contract_strk.balanceOf(contractAddress)
  );
}

async function main() {
  const privateKey =
    "0x297c53b2998da162e534aacaed1ab468f369b78e4cdf06214c95e9aa438371c";
  console.log("New OZ account:\nprivateKey =", privateKey);
  const starkKeyPub =
    "0x89054276d144692940878eb72d9d93ce489c6fc476a108a7edacfd10a3c700";
  console.log("publicKey =", starkKeyPub);

  const accountClassHash =
    "0x7446579979174f1687e030b2da6a0bf41ec995a206ddf314030e504536c61c1";

  try {
    const accountConstructorCallData = CallData.compile({
      publicKey: starkKeyPub,
    });

    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      accountClassHash,
      accountConstructorCallData,
      0
    );

    console.log("Precalculated account address =", contractAddress);
    await transfer_funds(contractAddress);

    const account = new Account(provider, contractAddress, privateKey);

    const { transaction_hash, contract_address } = await account.deployAccount(
      {
        classHash: accountClassHash,
        constructorCalldata: accountConstructorCallData,
        addressSalt: starkKeyPub,
      },
      {
        nonce: 1,
        maxFee: "2870302852309280000",
      }
    );

    await provider.waitForTransaction(transaction_hash);

    console.log(
      "✅ New OpenZeppelin account created.\n   address =",
      contract_address
    );
  } catch (err) {
    console.log("Error : ", err);
  }
}

main();
