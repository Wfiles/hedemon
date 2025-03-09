const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const dotenv = require('dotenv');
const { Mistral } = require('@mistralai/mistralai');
const { AccountId, PrivateKey, Client, TokenCreateTransaction, TokenType, TokenSupplyType, Hbar, TokenMintTransaction } = require("@hashgraph/sdk");
// const base64 = require('base-64'); // or use Node's Buffer if preferred
const { OpenAI } = require('openai');


dotenv.config();

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const TCG_API_URL = 'https://api.pokemontcg.io/v2/cards';

const JWT = process.env.PINATA_JWT;



// async function uploadImageToImgur(imagePathOrData) {
//     const form = new FormData();
      
//     // If the provided data is a valid file path, use a file stream.
//     // Otherwise, assume it's a base64 string.
//     if (fs.existsSync(imagePathOrData)) {
//       form.append('image', fs.createReadStream(imagePathOrData));
//     } else {
//       // Remove header if present (e.g., "data:image/jpeg;base64,")
//       const base64Data = imagePathOrData.includes(',')
//         ? imagePathOrData.split(',')[1]
//         : imagePathOrData;
//       form.append('image', base64Data);
//     }
  
//     try {
//       const response = await axios.post('https://api.imgur.com/3/upload', form, {
//         headers: {
//           ...form.getHeaders(),
//           Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
//         },
//       });
  
//       if (response.data.success) {
//         const link = response.data.data.link;
//         console.log('Image uploaded successfully:', link);
//         return link;
//       } else {
//         console.error('Error uploading image:', response.data.data.error);
//         return null;
//       }
//     } catch (error) {
//       console.error('Request error:', error);
//       return null;
//     }
//   }

  async function gpt(imageData) {
    const prompt = `
    The image you're analyzing contains a Pokémon card. Please extract the following information:
    1. The Pokémon's name (e.g., "Yungoos").
    2. The Pokémon's number, which is located in the bottom-left corner of the card in the format "XXX/YYY" (e.g., "117/159"). Extract only the "XXX" part of the number (e.g., "117").

    Return this information in a structured JSON format. Example:
    {
      "name": "Yungoos",
      "number": "117"
    }
`   ;
    // Set up OpenAI client configuration (ensure you set your API key appropriately)

    const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY // Replace with your OpenAI API key
    });

    async function ocrWithOpenAI(base64Image, prompt) {
    try {
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
            role: "user",
            content: [
                { type: "text", text: prompt },
                {
                type: "image_url",
                image_url: {
                    url: `${base64Image}`
                }
                }
            ]
            }
        ],
        max_tokens: 1000
        });

        let responseText = response.choices[0].message.content;
        responseText = responseText.replace(/`/g, '').replace(/^json\s*\n*/, '').trim();

        const extractedData = JSON.parse(responseText);

        const pokemonName = extractedData.name;
        const pokemonNumber = extractedData.number;

        console.log('Pokémon Name:', pokemonName);
        console.log('Pokémon Number:', pokemonNumber);

        await fetchPokemonCardInfo(pokemonName, pokemonNumber);
    } catch (error) {
        console.error("Error in OCR processing:", error);
        throw error;
    }
    }

    try {
    const response = await ocrWithOpenAI(imageData, prompt);
    console.log('Texte extrait de l\'image :', response);
    return response;
    } catch (error) {
    console.error("Error in GPT processing:", error);
    throw error;
    }
  }

//   async function extractTextFromImage(imageUrl) {
//     const client = new Mistral({ apiKey: MISTRAL_API_KEY });

//     try {
//         const prompt = `
//             The image you're analyzing contains a Pokémon card. Please extract the following information:
//             1. The Pokémon's name (e.g., "Yungoos").
//             2. The Pokémon's number, which is located in the bottom-left corner of the card in the format "XXX/YYY" (e.g., "117/159"). Extract only the "XXX" part of the number (e.g., "117").

//             Return this information in a structured JSON format. Example:
//             {
//               "name": "Yungoos",
//               "number": "117"
//             }
//         `;

//         const chatResponse = await client.chat.complete({
//             model: "pixtral-12b",
//             messages: [
//               {
//                 role: "user",
//                 content: [
//                   { type: "text", text: prompt },
//                   {
//                     type: "image_url",
//                     imageUrl: imageUrl,
//                   },
//                 ],
//               },
//             ],
//         });

//         // Déclarer la variable 'responseText' avant de l'utiliser
//         let responseText = chatResponse.choices[0].message.content;

//         // Nettoyer la réponse (enlever les backticks et le mot "json")
//         responseText = responseText.replace(/`/g, '').replace(/^json\s*\n*/, '').trim();
//         console.log('Texte extrait de l\'image :', responseText);

//         // Vérifier si la réponse est un JSON valide
//         try {
//             const extractedData = JSON.parse(responseText);

//             // Stockage du nom et du numéro du Pokémon dans des variables
//             const pokemonName = extractedData.name;
//             const pokemonNumber = extractedData.number;

//             // Affichage des résultats
//             console.log('Pokémon Name:', pokemonName);
//             console.log('Pokémon Number:', pokemonNumber);

//             // Appeler l'API TCG pour récupérer plus d'informations sur la carte
//             await fetchPokemonCardInfo(pokemonName, pokemonNumber);

//         } catch (jsonError) {
//             console.error('Erreur de parsing JSON :', jsonError);
//         }

//     } catch (error) {
//         console.error("Erreur lors de l'appel à l'API Mistral Vision : ", error);
//     }
// }

async function fetchPokemonCardInfo(pokemonName, pokemonNumber) {
    try {
        const response = await axios.get(TCG_API_URL, {
            params: {
                q: `name:${pokemonName} number:${pokemonNumber}`, // Filtrage par nom et numéro de carte
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.data.data.length > 0) {
            // Récupérer la première carte correspondant à la recherche
            const card = response.data.data[0];

            console.log('Card Information:', card);

            // Ici on récupère l'URL de l'image de la carte Pokémon
            const cardImageUrl = card.images.large;

            // Créer un NFT avec les informations récupérées
            await createNFT(card);

        } else {
            console.log('Aucune carte trouvée pour ce Pokémon.');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des informations de la carte :', error);
    }
}

async function uploadMetadataToIPFS(jsonData) {
    try {
        const filePath = "metadata.json";
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

        // Read the entire file into a Buffer
        const fileBuffer = fs.readFileSync(filePath);
        
        const formData = new FormData();
        // Append as Buffer instead of stream
        formData.append("file", fileBuffer, {
            filename: "metadata.json",
            contentType: "application/json"
        });
        formData.append("network", "public");

        // Get length ASYNC with proper error handling
        const contentLength = await new Promise((resolve, reject) => {
            formData.getLength((err, length) => {
                if (err) reject(err);
                resolve(length);
            });
        });

        const headers = {
            ...formData.getHeaders(),
            Authorization: `Bearer ${JWT}`,
            'Upload-Length': contentLength.toString(),
            'Content-Length': contentLength.toString() // Add explicit Content-Length
        };

        const response = await axios.post(
            'https://uploads.pinata.cloud/v3/files',
            formData,
            { 
                headers,
                maxContentLength: Infinity, // Allow large payloads
                maxBodyLength: Infinity 
            }
        );

        fs.unlinkSync(filePath);

        if (response.data?.data?.cid) {
            console.log("Upload successful:", response.data);
            return response.data.data.cid;
        } else {
            console.error("API Error:", response.data);
            return null;
        }
    } catch (error) {
        console.error("Upload failed:", error.response?.data || error.message);
        return null;
    }
}

async function createNFT(pokemonJson) {
    let client;
    try {
        // Your account ID and private key from string value
        const MY_ACCOUNT_ID = AccountId.fromString(process.env.ACCOUNT_ID);
        const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(process.env.PRIVATE_KEY);

        // Pre-configured client for test network (testnet)
        client = Client.forTestnet();

        // Set the operator with the account ID and private key
        client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

        // Préparer les métadonnées pour le NFT
        const metadata = {
            "name": pokemonJson.name,
            "description": "A unique Pokémon NFT",
            "image": pokemonJson.images.large,
            "properties": pokemonJson
        };

        console.log(metadata)

        // Télécharger les métadonnées sur IPFS
        const ipfsHash = await uploadMetadataToIPFS(metadata);
        const CID_link = `ipfs://${ipfsHash}`;

        const CID = [
          Buffer.from(
            CID_link
          )
        ];

        console.log("IPFS CID link:", CID_link);

        const setName = pokemonJson.set.name;
        const setSymbol = pokemonJson.set.ptcgoCode;

        // Start the NFT creation process
        const nftCreateTransaction = new TokenCreateTransaction()
            .setTokenName(setName)
            .setTokenSymbol(setSymbol)
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setSupplyKey(MY_PRIVATE_KEY)
            .setTreasuryAccountId(MY_ACCOUNT_ID)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(250)
            .freezeWith(client);

        const nftCreateTxSign = await nftCreateTransaction.signWithOperator(client);
        const nftCreateSubmit = await nftCreateTxSign.execute(client);
        const nftCreateRx = await nftCreateSubmit.getReceipt(client);
        console.log("Token ID: " + nftCreateRx.tokenId.toString());

        const maxTransactionFee = new Hbar(20);
        
        // Créer un NFT avec l'IPFS hash des métadonnées
        const nftMintTransaction = new TokenMintTransaction()
            .setTokenId(nftCreateRx.tokenId)
            .setMetadata(CID) // Utilise l'IPFS hash pour les métadonnées
            .setMaxTransactionFee(maxTransactionFee)
            .freezeWith(client);

        const nftMintTxSign = await nftMintTransaction.signWithOperator(client);
        const nftMintSubmit = await nftMintTxSign.execute(client);
        const nftMintRx = await nftMintSubmit.getReceipt(client);

        console.log("NFT Minted: " + nftMintRx.serials.toString());

    } catch (error) {
        console.error(error);
    } finally {
        if (client) client.close();
    }
}


async function processImage(imageData) {

    // const imageUrl = await uploadImageToImgur(imageData);
    return await gpt(imageData);

    }

  const cardAnalysis = async (req, res) => {
    console.log("Processing card analysis...");

    const { imageData } = req.body;
    
    try {
        const data = await processImage(imageData);
        
        if (!data) {
            return res.status(400).json({ error: "Failed to process the image" });
        }

        console.log("NFT created successfully");
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in cardAnalysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = {
    cardAnalysis
}