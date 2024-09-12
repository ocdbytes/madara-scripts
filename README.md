# Scripts for madara

```diff
-⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⠶⠞⠛⠛⠛⠛⠻⠶⢶⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀
-⠀⠀⠀⠀⠀⣠⣴⠟⠋⠁⠀⠀⠀⠀⠀⣀⣀⠀⠀⠀⠈⠉⠻⢶⣄⠀⠀⠀⠀⠀
-⠀⠀⠀⣠⡾⠋⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣟⠛⠒⠄⠀⠀⠀⠀⠙⢷⣄⠀⠀⠀
-⠀⠀⣴⠟⠀⠀⠀⠀⠀⠀⠀⢀⣰⣿⣿⣿⣿⣆⡀⠀⠀⠀⠀⠀⠀⠀⠹⣧⡀⠀
-⠀⣼⠏⠀⠀⠀⠀⠀⠀⡠⠊⠁⠀⠙⠿⠿⠛⠀⠈⠑⢄⠀⠀⠀⠀⠀⠀⠘⣷⠀
-⢰⡟⠀⠀⠀⠀⠀⢀⠎⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⡀⠀⠀⠀⠀⠀⢹⣇
-⣾⠃⠀⠀⠀⠀⠀⡜⠀⠀⠀⠀⢠⣶⣿⣿⣷⣄⠀⠀⠀⠀⢳⠀⠀⠀⠀⠀⠀⣿
-⣿⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⣿
-⢿⡄⠀⠀⢠⠀⢀⣷⣶⣤⡀⠀⠘⢿⣿⣿⡿⠋⠀⠀⣠⣴⣾⣄⠀⠀⠀⠀⠀⣿
-⠸⣧⠀⠀⢸⣷⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠰⣿⣿⣿⣿⣧⠀⠀⠀⣸⡏
-⠀⢻⣆⠀⠀⠙⠿⠿⠿⠛⢅⡀⠀⠀⠀⠀⠀⠀⢀⡠⠛⠛⠛⣿⡟⠀⠀⢠⡿⠀
-⠀⠀⢻⣦⠀⠀⠀⠀⠀⠀⠀⠈⠑⠒⠒⠀⠐⠊⠁⠀⠀⡠⠞⠋⠀⠀⣠⡿⠁⠀
-⠀⠀⠀⠙⢷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀⠀
-⠀⠀⠀⠀⠀⠙⠷⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⡾⠋⠀⠀⠀⠀⠀
-⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠷⠶⣦⣤⣤⣤⣤⣤⡶⠾⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀
```

- Madara Repo Link : [Git Repo :)](https://github.com/madara-alliance/madara)
- To run the madara sequencer :

  ```sh
  cargo run --release \
  -- --name madara \
  --base-path ../madara6 \
  --network sepolia \
  --authority \
  --telemetry-disabled \
  --rpc-port 9944 \
  --rpc-cors "*" \
  --rpc-external \
  --devnet \
  --l1-endpoint https://sepolia.infura.io/v3/$INFURA_API_KEY
  ```

## Scripts Available

- declareContract (args : `nonce of account0`)
- deployAccount (args : `nonce of account0`, `nonce of sender account`)
- deployContract (args : `nonce of account0`)
- deployContract_UDC (args : `nonce of account0`)

`constants.js` is where we store all the vars.
