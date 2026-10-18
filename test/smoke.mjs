// Live, read-only smoke test against https://rpc.brainark.online — no keys, no transactions.
import { createBrainArkClient, ADDRESSES, getBakBalance, getActiveListings, getAsset, getOwnedAssetIds, getStakingInfo } from '../src/index.js';
const c = createBrainArkClient(); let ok = 0, bad = 0;
const check = (cond, msg) => { console.log(`${cond ? '✔' : '✘'} ${msg}`); cond ? ok++ : bad++; };
check((await c.getChainId()) === 1236, 'connected to chain 1236');
for (const [n, a] of Object.entries(ADDRESSES)) check(n === 'AdminSafe' || (await c.getCode({ address: a }))?.length > 2, `${n} has contract code`);
const bal = await getBakBalance(c, ADDRESSES.AdminSafe); check(typeof bal.bak === 'string', `getBakBalance works (Safe holds ${bal.bak} BAK)`);
const listings = await getActiveListings(c); check(Array.isArray(listings), `getActiveListings → ${listings.length} listing(s)`);
const first = listings[0];
if (first) {
  const asset = await getAsset(c, first.assetId); check(!!asset.owner && typeof asset.name === 'string', `getAsset(#${first.assetId}) → "${asset.name}" (${asset.assetType})`);
  const ids = await getOwnedAssetIds(c, asset.owner); check(Array.isArray(ids), `getOwnedAssetIds(owner) → ${ids.length} id(s)`);
  const st = await getStakingInfo(c, first.assetId); check(st && 'stakedAmount' in st, `getStakingInfo(#${first.assetId}) → staked ${st.stakedAmount}`);
}
console.log(`\n${ok} passed, ${bad} failed`); process.exitCode = bad ? 1 : 0;
