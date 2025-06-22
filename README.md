# DripShippa: Decentralized Shipping Brokerage on Polygon zkEVM

**DripShippa** is a next-generation shipping brokerage platform that leverages blockchain, AI, and modern web technologies to create a secure, transparent, and automated maritime logistics marketplace. The platform is deployed on the Polygon zkEVM Cardona testnet and is built using [Lovable](https://lovable.dev/), [Supabase](https://supabase.com/), and Google Gemini-powered AI agents (integrated via Supabase Edge Functions).

---

## 🚢 What is DripShippa?

DripShippa connects shippers and carriers in a decentralized marketplace, enabling:

- **NFT-based Orders:** Every shipping order, vessel, cargo, and journey is represented as a unique NFT on-chain.
- **Parametric Insurance:** Smart contracts provide customizable, automated insurance policies for shipments, with instant payouts based on real-world data triggers.
- **AI-Powered Routing & Risk:** Google Gemini agents (invoked via Supabase Edge Functions) suggest optimal shipping routes and assess risk for insurance, making logistics smarter and safer. Route optimization results are visualized interactively on Google Maps.
- **Transparent Brokerage:** All order matching, insurance, and journey logs are recorded on the Polygon zkEVM blockchain for full transparency.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, shadcn-ui, Tailwind CSS
- **Smart Contracts:** Solidity, deployed on Polygon zkEVM (Cardona testnet)
- **Backend & Auth:** Supabase (Postgres, Auth, Edge Functions)
- **AI Agents:** Google Gemini (integrated via Supabase Edge Functions)
- **DevOps & Hosting:** Lovable (AI-powered development, instant deployment)

---

## ⚙️ Key Features

### 1. Blockchain-Powered Shipping

- **VesselNFT, CargoNFT, JourneyNFT, InsurancePolicyNFT, Brokerage** contracts deployed on Polygon zkEVM.
- All shipping assets and transactions are tokenized and verifiable on-chain.

### 2. Parametric Insurance

- Create or select insurance policies (delay, weather, piracy, etc.) with automated, data-driven payouts.
- Policies are enforced by smart contracts and can be customized via the UI.

### 3. AI-Driven Logistics

- **Route Optimization:** Google Gemini agents (via Supabase Edge Functions) suggest optimal shipping routes, which are visualized interactively on Google Maps within the app.
- **Risk Assessment:** AI agents analyze routes and conditions to recommend insurance coverage and premiums.

### 4. Supabase Integration

- Real-time database for orders, policies, and user profiles.
- Edge Functions for AI agent integration (Gemini) and secure backend logic.
- Auth and RLS for secure, user-specific data access.

### 5. Lovable Development

- Built and deployed using [Lovable](https://lovable.dev/), enabling AI-assisted code generation, instant previews, and one-click publishing.

---

## 🚀 Getting Started

### 1. Clone & Install

```sh
git clone <YOUR_GIT_URL>
cd drip-shipper-secure-flow
npm install
```

### 2. Run Locally

```sh
npm run dev
```

### 3. Deploy

- Use [Lovable](https://lovable.dev/projects/aa64918e-77d9-4e4d-acf0-ccf436c91336) for instant deployment and preview.
- Or deploy manually to your preferred host.

### 4. Connect to Polygon zkEVM

- The app is pre-configured for the Polygon zkEVM Cardona testnet.
- Update contract addresses in `src/lib/walletSecrets.ts` if deploying your own contracts.

---

## 🧠 AI Agents: Google Gemini (via Supabase Edge Functions)

- **Route Planning:** The `AiRouteModal` component invokes a Supabase Edge Function (`gemini-maps-handler`) that uses Google Gemini to suggest and visualize optimal shipping routes. These routes are displayed interactively on Google Maps within the app, allowing users to see the AI-optimized path and milestones.
- **Risk Analysis:** The `ContractBuilder` page uses an AI agent (`ai-risk-assessor`), also powered by Supabase Edge Functions, to analyze risk and recommend insurance parameters.
- **Supabase Edge Functions** serve as the secure integration layer between the app and Google Gemini, ensuring privacy and scalability.

---

## 🛡️ Parametric Insurance

- Choose from standard templates or create custom policies (delay, weather, piracy, etc.).
- Policies are enforced by smart contracts and can be viewed on-chain via Polygon zkEVM block explorer.

---

## 📦 Smart Contracts

- **VesselNFT:** Tokenizes vessels.
- **CargoNFT:** Tokenizes cargo.
- **JourneyNFT:** Tracks journeys.
- **InsurancePolicyNFT:** Manages insurance policies.
- **Brokerage:** Handles order matching and settlement.

All contracts are deployed on Polygon zkEVM Cardona testnet.

---

## 🗄️ Database Schema

- **Supabase** manages all off-chain data, including orders, insurance policies, and user profiles.
- Row-level security (RLS) ensures users can only access their own data.

---

## 🎛️ Vibe Coding Tools

- **Lovable:** Used for Frontend development and seamless Supabase integration.
- **Google Gemini:** Used for designing and generating complex pieces of code, including AI-powered route optimization and risk analysis.
- **Cursor:** Used for general implementation and code editing throughout the project.

Prompts and workflow documentation are hosted here: [Vibe Coding Prompts & Docs](https://docs.google.com/document/d/1DaTm2yIKkEmPob1Nzx1OGwWjCG4KSNkk4ns3uzj65OE/edit?usp=sharing)

---

**Made by:** Kevin Khoo and Kilian H. Scheutwinkel

---

## 📄 License

MIT

---

## 🌐 Links

- [Lovable Project](https://drip-shipper-secure-flow.lovable.app)
- [Polygon zkEVM Cardona Explorer](https://cardona-zkevm.polygonscan.com/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://deepmind.google/technologies/gemini/)

---
