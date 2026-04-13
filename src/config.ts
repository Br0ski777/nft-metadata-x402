import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "nft-metadata",
  slug: "nft-metadata",
  description: "Fetch NFT metadata from contract address and token ID via public APIs.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/metadata",
      price: "$0.003",
      description: "Fetch NFT metadata from contract and token ID",
      toolName: "crypto_get_nft_metadata",
      toolDescription: "Use this when you need to fetch metadata for an NFT given its contract address and token ID. Returns the token name, description, image URL, attributes/traits, and collection info. Supports Ethereum and Base chains via public APIs. Do NOT use for wallet balances — use wallet_get_portfolio instead. Do NOT use for ENS resolution — use crypto_resolve_ens instead.",
      inputSchema: {
        type: "object",
        properties: {
          contract: { type: "string", description: "NFT contract address (e.g. 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D)" },
          tokenId: { type: "string", description: "Token ID within the contract" },
          chain: { type: "string", description: "Blockchain: 'ethereum' or 'base' (default: ethereum)" },
        },
        required: ["contract", "tokenId"],
      },
    },
  ],
};
