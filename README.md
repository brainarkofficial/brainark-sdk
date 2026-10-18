# BrainArk SDK

Chain definition, live contract addresses, ABIs and read helpers for the **BrainArk** chain (chain ID **1236**, native coin **BAK**).
Built on [viem](https://viem.sh). Read-only by design — sign transactions with your own wallet; this package never touches private keys.

```bash
npm install viem   # peer dependency
# then copy or install this package (not yet published to npm)
```

```js
import { createBrainArkClient, getBakBalance, getActiveListings, getAsset, ADDRESSES, brainark } from '@brainark/sdk';

const client = createBrainArkClient();                 // https://rpc.brainark.online
const { bak } = await getBakBalance(client, '0xYourAddress');
const listings = await getActiveListings(client);      // RWA marketplace
const asset = await getAsset(client, listings[0].assetId);
console.log(bak, listings.length, asset.name, asset.assetType);
```

## What's included
| Export | What it does |
|---|---|
| `brainark` | viem chain definition (id 1236, BAK, RPC, explorer) |
| `ADDRESSES` | live contract addresses (RWA AssetRegistry, Marketplace, StakingManager, ClaimSystem, Extensions, BUSDT, BAKvault factory + registry, admin Safe) |
| `AssetRegistryAbi`, `MarketplaceAbi`, `StakingManagerAbi`, `ERC20Abi` | ABIs from the bytecode-verified builds (see brainark-contracts) |
| `createBrainArkClient(rpcUrl?)` | read-only client |
| `getBakBalance(client, address)` | native BAK balance `{ wei, bak }` |
| `getAsset(client, tokenId)` | owner, type, staked BAK, issuer, dates, name, description, image, metadata hash |
| `getOwnedAssetIds(client, owner)` | RWA asset token IDs owned by an address |
| `getActiveListings(client)` | active marketplace listings |
| `getStakingInfo(client, assetId)` | staked amount, staked-at, pending unstake request time |
| `addBrainArkToWallet(window.ethereum)` | switch to / add BrainArk in the user's wallet |

## Good to know
- **Marketplace:** a buyer sends exactly the listing's `priceInBAK`. The 2% trading fee (and any creator royalty) is taken out of
  the seller's proceeds — not added on top for the buyer.
- **Admin:** RWA contract admin roles are held by a 2-of-3 Safe (`ADDRESSES.AdminSafe`).
- REST API for apps (API keys, write endpoints): see **brainark-developer-docs**.

## Test
`npm install && npm test` — live, read-only checks against the public RPC (no keys, no transactions).

Licence: MIT. Security reports: GitHub private vulnerability reporting on brainark-contracts.
