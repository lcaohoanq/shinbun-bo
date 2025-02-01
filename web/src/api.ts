import axios from "axios";
import { GITHUB_TOKEN } from "./environments/utils";

export const githubApi = axios.create({
  baseURL: "https://api.github.com/repos/lcaohoanq/shinbun",
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  },
});
