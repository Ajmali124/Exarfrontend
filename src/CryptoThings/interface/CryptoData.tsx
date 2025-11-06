// Rename the existing CryptoCurrency type
export interface CryptoData {
    id: number;
    name: string;
    symbol: string;
    quotes: Quotes[];
    // Add more properties as needed
}

// Define the CryptoDataResponse using the renamed CryptoCurrency type
export interface CryptoDataResponse {
    data: {
        cryptoCurrencyList: ExtendedCryptoCurrency[]; // Change to ExtendedCryptoCurrency
        // Add more properties as needed
    };
    status: {
        // Add properties from the status object
    };
}

// Create a new CryptoCurrency type with the required properties
export interface ExtendedCryptoCurrency extends CryptoData {
    quotes: Quotes[]; // Assuming quotes is an array of Quote objects
    // Add more properties as needed
}

// Define the Quote interface
export interface Quotes {
    name: string;
    price: number;
    volume24h: number;
    volume7d: number;
    volume30d: number;
    marketCap: number;
    selfReportedMarketCap: number;
    percentChange1h: number;
    percentChange24h: number;
    percentChange7d: number;
    lastUpdated: string;
    percentChange30d: number;
    percentChange60d: number;
    percentChange90d: number;
    fullyDilluttedMarketCap: number;
    marketCapByTotalSupply: number;
    dominance: number;
    turnover: number;
    ytdPriceChangePercentage: number;
}
