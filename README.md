# NFT Metadata API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://nft-metadata.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

NFT metadata lookup -- name, image, attributes, collection info from contract + token ID. Ethereum and Base. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "nft-metadata": {
      "url": "https://nft-metadata.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://nft-metadata.api.klymax402.com/api/metadata" \
  -H "Content-Type: application/json" \
  -d '{"contract":"...","tokenId":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `crypto_get_nft_metadata` | POST | `/api/metadata` | $0.003 | Fetch NFT metadata from contract and token ID |

### `crypto_get_nft_metadata`

Use this when you need to fetch metadata for a specific NFT by contract address and token ID. Returns full NFT details in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `contract` | string | yes | NFT contract address (e.g. 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D) |
| `tokenId` | string | yes | Token ID within the contract |
| `chain` | string | no | Blockchain: 'ethereum' or 'base' (default: ethereum) |

**Returns**

- `name` -- NFT token name
- `description` -- token description text
- `imageUrl` -- URL to the NFT image/media
- `attributes` -- array of trait objects with trait_type and value
- `collection` -- collection name and contract info
- `tokenStandard` -- ERC-721 or ERC-1155
- `chain` -- which blockchain the NFT is on

Example response:

```json
{"name":"Bored Ape #1234","description":"A unique digital collectible...","imageUrl":"ipfs://Qm...","attributes":[{"trait_type":"Background","value":"Blue"},{"trait_type":"Fur","value":"Gold"}],"collection":"BoredApeYachtClub","tokenStandard":"ERC-721","chain":"ethereum"}
```

**When to use**: NFT verification, display, and trait analysis. Essential for NFT marketplace agents and collection tools.

**Not for**: wallet balances (use `wallet_get_portfolio`), ENS resolution (use `crypto_resolve_ens`), token safety (use `token_check_safety`).

## Example agent prompts

- "Fetch metadata for a specific NFT by contract address and token ID"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
