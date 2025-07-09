import axiosInstance from "./axiosInstance";

// Definition for a quote
export interface Quote {
  text: string;
  author: string;
  source: string;
}

// Wrapper for the quote endpoint response
export interface QuoteResponse {
  quote: Quote;
}

// Fetch the quote of the day
export async function GetQuote(): Promise<QuoteResponse> {
  try {
    const response = await axiosInstance.get('/get-quote');
    return await response.data;
  } catch (err) {
    console.error('Error fetching quote:', err);
    return { quote: { text: '', author: '', source: '' } };
  }
}

// Response for picking a new quote
export interface PickNewQuoteResponse {
  success: boolean;
}

// Pick a new quote of the day (admin only)
export async function PickNewQuote(): Promise<PickNewQuoteResponse> {
  try {
    const response = await axiosInstance.get('/pick-new-quote');
    return await response.data;
  } catch (err) {
    console.error('Error picking new quote:', err);
    return { success: false };
  }
}

