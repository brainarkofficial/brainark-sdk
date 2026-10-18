// BrainArk SDK — read helpers for the BrainArk chain (chain ID 1236). Built on viem. Read-only by design:
// sign transactions with your own wallet (BAKvault, MetaMask, …); this package never handles private keys.
import { createPublicClient, defineChain, http, formatEther, getAddress } from 'viem';
import AssetRegistryAbi from '../abis/AssetRegistry.json' with { type: 'json' };
import MarketplaceAbi from '../abis/Marketplace.json' with { type: 'json' };
import StakingManagerAbi from '../abis/StakingManager.json' with { type: 'json' };
import ERC20Abi from '../abis/ERC20.json' with { type: 'json' };

export { AssetRegistryAbi, MarketplaceAbi, StakingManagerAbi, ERC20Abi };

export const brainark = defineChain({
  id: 1236,
  name: 'BrainArk',
  nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.brainark.online'] } },
  blockExplorers: { default: { name: 'BrainArk Explorer', url: 'https://explorer.brainark.online' } },
});

/** Live contract addresses on BrainArk (chain 1236). Proxies are the addresses apps use. */
export const ADDRESSES = {
  AssetRegistry: '0xFf76Ea2EED588D0bFAF5466Bd0F20C3D980bd95D',
  Marketplace: '0x5C1A47d5E813211025e6653099BAAc89E8DeF9C3',
  StakingManager: '0x3071300Ee44211E3401925636f0D4F3F11eb13f5',
  ClaimSystem: '0xd7497c50FDdA2A568D385F5780779d079B70fECc',
  Extensions: '0x32e5896381E8084Cd9177e9EEa68Fbc0411A5715',
  BUSDT: '0x66702Bb4A3346f12EbAc4D63A4Cf440b378Dfa07',
  BAKVaultFactoryV2: '0x6609bC2cFe7f07D0382e0C7c32769A2c4A7A76Ef',
  BAKVaultRegistry: '0xeE522abE623697dd89d34Eda32994e03DCaf61E8',
  AdminSafe: '0xA1b028047E0977088E481b7256Ce6cBF9fd7fe01',
};

/** Create a read-only client for BrainArk. */
export function createBrainArkClient(rpcUrl = 'https://rpc.brainark.online') {
  return createPublicClient({ chain: brainark, transport: http(rpcUrl) });
}

/** Native BAK balance of an address, as { wei, bak }. */
export async function getBakBalance(client, address) {
  const wei = await client.getBalance({ address: getAddress(address) });
  return { wei, bak: formatEther(wei) };
}

/** One RWA asset NFT: owner, on-chain data and metadata. */
export async function getAsset(client, tokenId) {
  const id = BigInt(tokenId);
  const [owner, d, m] = await Promise.all([
    client.readContract({ address: ADDRESSES.AssetRegistry, abi: AssetRegistryAbi, functionName: 'ownerOf', args: [id] }),
    client.readContract({ address: ADDRESSES.AssetRegistry, abi: AssetRegistryAbi, functionName: 'assetData', args: [id] }),
    client.readContract({ address: ADDRESSES.AssetRegistry, abi: AssetRegistryAbi, functionName: 'assetMetadata', args: [id] }),
  ]);
  return {
    tokenId: id, owner,
    assetType: d[1], stakedBAK: d[2], issuer: d[3], issuedAt: d[4], lastTransferAt: d[5], isActive: d[6], isUnstaked: d[7],
    name: m[0], description: m[1], image: m[2], externalUrl: m[3], ipfsMetadataHash: m[4],
  };
}

/** Token IDs of the RWA assets an address currently owns. */
export async function getOwnedAssetIds(client, owner) {
  return client.readContract({ address: ADDRESSES.AssetRegistry, abi: AssetRegistryAbi, functionName: 'getOwnerAssets', args: [getAddress(owner)] });
}

/** All active marketplace listings. Buyers pay exactly `priceInBAK`; the 2% fee comes out of the seller's proceeds. */
export async function getActiveListings(client) {
  return client.readContract({ address: ADDRESSES.Marketplace, abi: MarketplaceAbi, functionName: 'getActiveListings' });
}

/** Staking info for an asset: staked amount, when it was staked, and any pending unstake request time. */
export async function getStakingInfo(client, assetId) {
  return client.readContract({ address: ADDRESSES.StakingManager, abi: StakingManagerAbi, functionName: 'getStakingInfo', args: [BigInt(assetId)] });
}

/** Ask an EIP-1193 wallet (window.ethereum) to add/switch to BrainArk. */
export async function addBrainArkToWallet(ethereum) {
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4d4' }] });
  } catch (e) {
    if (e?.code !== 4902) throw e;
    await ethereum.request({ method: 'wallet_addEthereumChain', params: [{
      chainId: '0x4d4', chainName: 'BrainArk', nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
      rpcUrls: ['https://rpc.brainark.online'], blockExplorerUrls: ['https://explorer.brainark.online'],
    }] });
  }
}
