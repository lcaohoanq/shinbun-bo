export const GITHUB_TOKEN =
  import.meta.env.VITE_REACT_APP_GITHUB_TOKEN ?? "not found";
export const env = {
  username: import.meta.env.VITE_AUTHENTICATED_USER ?? "wrong username",
  password: import.meta.env.VITE_AUTHENTICATED_PASSWORD ?? "wrong password",
};
