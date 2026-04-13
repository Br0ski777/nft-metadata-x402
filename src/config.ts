import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "nft-metadata",
  slug: "nft-metadata",
  description: "NFT metadata lookup -- name, image, attributes, collection info from contract + token ID. Ethereum and Base.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/metadata",
      price: "$0.003",
      description: "Fetch NFT metadata from contract and token ID",
      toolName: "crypto_get_nft_metadata",
      toolDescription: `Use this when you need to fetch metadata for a specific NFT by contract address and token ID. Returns full NFT details in JSON.

1. name: NFT token name
2. description: token description text
3. imageUrl: URL to the NFT image/media
4. attributes: array of trait objects with trait_type and value
5. collection: collection name and contract info
6. tokenStandard: ERC-721 or ERC-1155
7. chain: which blockchain the NFT is on

Example output: {"name":"Bored Ape #1234","description":"A unique digital collectible...","imageUrl":"ipfs://Qm...","attributes":[{"trait_type":"Background","value":"Blue"},{"trait_type":"Fur","value":"Gold"}],"collection":"BoredApeYachtClub","tokenStandard":"ERC-721","chain":"ethereum"}

Use this FOR NFT verification, display, and trait analysis. Essential for NFT marketplace agents and collection tools.

Do NOT use for wallet balances -- use wallet_get_portfolio instead. Do NOT use for ENS resolution -- use crypto_resolve_ens instead. Do NOT use for token safety -- use token_check_safety instead.`,
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
