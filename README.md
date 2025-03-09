# Hedemon - Verifiable Pokémon Card NFTs

![Hedemon Illustartion 1](./hedemon-illustration-1.png)  

Hedemon is a blockchain-powered platform that transforms Pokémon cards into **verifiable NFTs** using **Hedera Hashgraph**. By integrating **machine learning**, cryptographic hashing, and smart contracts, we ensure **authenticity, ownership, and privacy** for collectors.  

Our solution is **scalable** and can be extended beyond Pokémon cards to **identity documents, diplomas, and other collectible assets**.  

## Features  

- **Scan & Mint**: Convert physical Pokémon cards into unique, blockchain-backed NFTs  
- **AI-Powered Authentication**: A machine learning model detects counterfeit cards before minting  
- **Hedera Integration**: Secure, low-cost transactions via **Hedera Token Service (HTS)** and **Hedera Consensus Service (HCS)**  
- **Privacy-First Approach**: Cryptographic hashing ensures proof of authenticity without exposing sensitive data  
- **Scalability**: Extendable to diplomas, identity documents, and other collectibles  

## Tech Stack  

- **Frontend**: React  
- **Backend**: Node.js, Express  
- **Blockchain**: Hedera Hashgraph (HTS, HCS, Smart Contracts)  
- **Machine Learning**: Image recognition for Pokémon card authentication  
- **APIs**:  
  - **TCG Pokémon API**: Fetch Pokémon card details  
  - **OpenAI ChatGPT API**: Pokémon detection and classification  

## Getting Started  

### Prerequisites  

Ensure you have **Node.js** and **npm** installed.  

### Installation  

1. Clone the repository:  
   ```bash
   git clone https://github.com/your-repo/hedemon.git
   cd hedemon
   ```

2. Install dependencies for both frontend and backend:  
   ```bash
   cd backend  
   npm install  
   cd ../frontend  
   npm install  
   ```

### Running the Project

Open **two separate terminals**, one for the backend and one for the frontend.

#### Backend  
In the first terminal, run:  
```bash
cd backend  
npm run start  
```

#### Frontend  
In the second terminal, run:  
```bash
cd frontend  
npm run start  
```

The frontend should be accessible at **http://localhost:3000**.  

## Contributors

We are three Master's students in Data Science at EPFL, passionate about blockchain technologies and their real-world applications.

- **Matthias Wyss** – GitHub: [@ymatthias-wyss](https://github.com/matthias-wyss)  
- **William Jallot** – GitHub: [@Wfiles](https://github.com/Wfiles)  
- **Yassine Wahidy** – GitHub: [@Quantador](https://github.com/Quantador)  

## License

This project is licensed under the **MIT License**.
