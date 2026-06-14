# PayGate

PayGate is a Web3 worker payment escrow application for Arc Testnet. It supports client and worker dashboards, deal creation, delivery proof, dispute tracking, automatic release, and USDC settlement.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Arc Testnet

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- USDC interface: `0x3600000000000000000000000000000000000000`

## Contracts

```bash
npm run contract:compile
npm run contract:deploy:arc
```

Set `ARC_PRIVATE_KEY` before deploying. After deployment, add the emitted contract address to `NEXT_PUBLIC_PAYGATE_ESCROW_ADDRESS`.
