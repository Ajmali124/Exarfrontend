"use server";
import axios from "axios";
import ApiConstants from "./api_contsants";
import { CryptoData, CryptoDataResponse } from "./CryptoData";


export async function getTopMarketData(): Promise<CryptoData[]> {
    try {
        const response = await axios.get(ApiConstants.topMarketCapDataApi);

        if (!response.data?.data?.cryptoCurrencyList) {
            throw new Error('Invalid response format');
        }

        const data: CryptoDataResponse = response.data;
        return data.data.cryptoCurrencyList.slice(0, 10) || [];
    } catch (error) {
        console.error('Error fetching top market data:', error);
        throw error;
    }
}

export async function getPriceGainer(): Promise<CryptoData[]> {
    try {
        const response = await axios.get(ApiConstants.topGainerDataApi);

        if (!response.data?.data?.cryptoCurrencyList) {
            throw new Error('Invalid response format');
        }

        const data: CryptoDataResponse = response.data;
        return data.data.cryptoCurrencyList.slice(0, 10) || [];
    } catch (error) {
        console.error('Error fetching top market data:', error);
        throw error;
    }
}

export async function getPriceLoser(): Promise<CryptoData[]> {
    try {
        const response = await axios.get(ApiConstants.topLosersDataApi);

        if (!response.data?.data?.cryptoCurrencyList) {
            throw new Error('Invalid response format');
        }

        const data: CryptoDataResponse = response.data;
        return data.data.cryptoCurrencyList.slice(0, 10) || [];
    } catch (error) {
        console.error('Error fetching top market data:', error);
        throw error;
    }
}


export async function getPrice2(): Promise<CryptoData[]> {
    try {
        const response = await axios.get(ApiConstants.allMarketCapDataApi);

        if (!response.data?.data?.cryptoCurrencyList) {
            throw new Error('Invalid response format');
        }

        const data: CryptoDataResponse = response.data;
        return data.data.cryptoCurrencyList.slice(0, 2) || [];
    } catch (error) {
        console.error('Error fetching top market data:', error);
        throw error;
    }
}


