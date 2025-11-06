// "use server";
// // Import necessary modules, interfaces, and constants
// import axios from "axios";
// import ApiConstants from "./api_contsants";

// // Define the interface for the article meta data
// export interface ArticleMeta {
//     subtitle: string;
//     // Include other properties if needed
// }

// // Define the interface for the article data
// interface ArticleData {
//     meta: ArticleMeta;
//     // Include other properties if needed
// }

// // Define the interface for the response data
// interface NewsResponse {
//     data: ArticleData[];
//     // Include other properties if needed
// }

// // Define the fetchNews function
// export async function fetchNews(): Promise<ArticleMeta[]> {
//     try {
//         // Make the API request
//         const response = await axios.get<NewsResponse>(ApiConstants.articleApi);

//         // Extract subtitles from the response data
//         const subtitles: ArticleMeta[] = response.data.data.map((item) => item.meta);

//         // Return the array of subtitles
//         return subtitles;
//     } catch (error) {
//         // Handle errors, e.g., log the error or throw it again
//         console.error('Error fetching news data:', error);
//         throw error;
//     }
// }
