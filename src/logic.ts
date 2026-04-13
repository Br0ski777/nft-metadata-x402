import type { Hono } from "hono";

// ERC721 tokenURI function selector
const TOKEN_URI_SELECTOR = "0xc87b56dd";
// ERC721 name() selector
const NAME_SELECTOR = "0x06fdde03";

function encodeTokenId(tokenId: string): string {
  const hex = BigInt(tokenId).toString(16);
  return hex.padStart(64, "0");
}

async function ethCall(rpcUrl: string, to: string, data: string): Promise<string> {
  const resp = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to, data }, "latest"],
      id: 1,
    }),
  });
  const json = await resp.json() as any;
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function decodeString(hex: string): string {
  if (!hex || hex === "0x" || hex.length < 130) return "";
  // Remove 0x prefix, skip offset (first 32 bytes) and length (next 32 bytes)
  const clean = hex.slice(2);
  const offset = parseInt(clean.slice(0, 64), 16) * 2;
  const length = parseInt(clean.slice(offset, offset + 64), 16);
  const strHex = clean.slice(offset + 64, offset + 64 + length * 2);
  return Buffer.from(strHex, "hex").toString("utf-8");
}

export function registerRoutes(app: Hono) {
  app.post("/api/metadata", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body?.contract || !body?.tokenId) {
      return c.json({ error: "Missing required fields: contract, tokenId" }, 400);
    }

    const contract: string = body.contract;
    const tokenId: string = body.tokenId;
    const chain: string = (body.chain || "ethereum").toLowerCase();

    const rpcUrls: Record<string, string> = {
      ethereum: "https://eth.llamarpc.com",
      base: "https://mainnet.base.org",
    };

    const rpcUrl = rpcUrls[chain];
    if (!rpcUrl) {
      return c.json({ error: `Unsupported chain: ${chain}. Supported: ethereum, base` }, 400);
    }

    try {
      // Get tokenURI
      const tokenUriData = TOKEN_URI_SELECTOR + encodeTokenId(tokenId);
      const tokenUriResult = await ethCall(rpcUrl, contract, tokenUriData);
      const tokenUri = decodeString(tokenUriResult);

      if (!tokenUri) {
        return c.json({ error: "No tokenURI found for this token. It may not exist or the contract may not support ERC721." }, 404);
      }

      // Get collection name
      let collectionName = "";
      try {
        const nameResult = await ethCall(rpcUrl, contract, NAME_SELECTOR);
        collectionName = decodeString(nameResult);
      } catch {}

      // Fetch metadata from tokenURI
      let metadata: any = {};
      let metadataUrl = tokenUri;

      // Handle IPFS URIs
      if (tokenUri.startsWith("ipfs://")) {
        metadataUrl = `https://ipfs.io/ipfs/${tokenUri.slice(7)}`;
      }
      // Handle data URIs
      if (tokenUri.startsWith("data:application/json;base64,")) {
        const base64Data = tokenUri.slice("data:application/json;base64,".length);
        metadata = JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));
      } else if (tokenUri.startsWith("data:application/json,")) {
        metadata = JSON.parse(decodeURIComponent(tokenUri.slice("data:application/json,".length)));
      } else {
        // Fetch from URL
        const metaResp = await fetch(metadataUrl, { signal: AbortSignal.timeout(10000) });
        if (metaResp.ok) {
          metadata = await metaResp.json();
        }
      }

      // Resolve image IPFS
      let imageUrl = metadata.image || metadata.image_url || null;
      if (imageUrl?.startsWith("ipfs://")) {
        imageUrl = `https://ipfs.io/ipfs/${imageUrl.slice(7)}`;
      }

      return c.json({
        contract,
        tokenId,
        chain,
        collectionName,
        tokenUri,
        name: metadata.name || null,
        description: metadata.description || null,
        image: imageUrl,
        externalUrl: metadata.external_url || null,
        attributes: metadata.attributes || [],
        animationUrl: metadata.animation_url || null,
      });
    } catch (e: any) {
      return c.json({ error: `Failed to fetch NFT metadata: ${e.message}` }, 500);
    }
  });
}
