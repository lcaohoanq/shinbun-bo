import axios from "axios";
import { GITHUB_TOKEN } from "./environments/utils";

export const githubApi = axios.create({
  baseURL: "https://api.github.com/repos/lcaohoanq/shinbun",
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  },
});

export const getPostContent = async (postName: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/lcaohoanq/shinbun/main/src/content/posts/${postName}`
    );
    return response.data;
  } catch (err) {
    console.error(`Failed to fetch content for ${postName}`, err);
    throw err;
  }
};
