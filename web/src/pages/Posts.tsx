import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingComponent from "../components/LoadingComponent";
import { PostDetail, PostList } from "../types/post.type";
import { githubApi } from "../api";

// Cache for markdown content
const markdownCache = new Map<string, string>();

// Interface for post with timestamp
interface PostWithTimestamp extends PostDetail {
  createdAt: string;
}

const Posts = () => {
  const [postList, setPostList] = useState<PostWithTimestamp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PostWithTimestamp | null>(
    null
  );
  const [originalPosts, setOriginalPosts] = useState<PostWithTimestamp[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoize the base URL for post viewing
  const baseViewUrl = useMemo(() => "https://shinbun.vercel.app/posts/", []);

  const getPostWithTimestamp = async (
    post: PostDetail
  ): Promise<PostWithTimestamp> => {
    try {
      const response = await githubApi.get(`/commits`, {
        params: {
          path: `src/content/posts/${post.name}`,
          per_page: 1,
        },
      });

      return {
        ...post,
        createdAt:
          response.data[0]?.commit?.author?.date || new Date().toISOString(),
      };
    } catch (err) {
      console.error(`Failed to fetch commit history for ${post.name}`, err);
      return {
        ...post,
        createdAt: new Date().toISOString(),
      };
    }
  };

  const getPostList = useCallback(async () => {
    try {
      setError(null);
      const response = await githubApi.get<PostList>(
        "/contents/src/content/posts"
      );

      if (response.status === 200) {
        // Fetch commit history for each post
        const postsWithTimestamps = await Promise.all(
          response.data.map((post) => getPostWithTimestamp(post))
        );

        // Sort by creation time in descending order
        const sortedPosts = postsWithTimestamps.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPostList(sortedPosts);
        setOriginalPosts(sortedPosts);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch posts";
      setError(errorMessage);
      console.error("Failed to fetch posts", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;

    try {
      setError(null);
      const response = await githubApi.delete(
        `/contents/src/content/posts/${confirmDelete.name}`,
        {
          data: {
            message: `Deleting post ${confirmDelete.name.slice(0, -3)}`,
            sha: confirmDelete.sha,
          },
        }
      );

      if (response.status === 200) {
        setPostList((prev) =>
          prev.filter((post) => post.sha !== confirmDelete.sha)
        );
        setOriginalPosts((prev) =>
          prev.filter((post) => post.sha !== confirmDelete.sha)
        );
        // Clear cache for deleted post
        markdownCache.delete(confirmDelete.name);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete post";
      setError(errorMessage);
      console.error("Delete failed", err);
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete]);

  const handleEditPost = useCallback(
    async (post: PostWithTimestamp) => {
      try {
        setError(null);

        // Check cache first
        let markdownContent = markdownCache.get(post.name) as string;

        if (!markdownContent) {
          const response = await axios.get(
            `https://raw.githubusercontent.com/lcaohoanq/shinbun/main/src/content/posts/${post.name}`
          );

          if (response.status === 200) {
            markdownContent = response.data;
            // Cache the content
            markdownCache.set(post.name, markdownContent);
          }
        }

        if (markdownContent) {
          navigate(`/posts/${post.name.slice(0, -3)}`, {
            state: { markdown: markdownContent },
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to edit post";
        setError(errorMessage);
        console.error("Edit failed", err);
      }
    },
    [navigate]
  );

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      setIsSearching(true);
      try {
        // Simulate a small delay to show loading effect
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!searchTerm.trim()) {
          setPostList(originalPosts);
        } else {
          const filteredPosts = originalPosts.filter((post) =>
            post.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setPostList(filteredPosts);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [originalPosts]
  );

  // Memoize post actions renderer to prevent unnecessary re-renders
  const renderPostActions = useCallback(
    (post: PostWithTimestamp) => {
      const postNameWithoutExt = post.name.slice(0, -3);
      const isMarkdown = post.name.includes(".md");

      if (isMobile) {
        return (
          <Box display="flex" flexDirection="column" gap={1}>
            {isMarkdown && (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  href={`${baseViewUrl}${postNameWithoutExt}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditPost(post)}
                >
                  Edit
                </Button>
              </>
            )}
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => setConfirmDelete(post)}
            >
              Delete
            </Button>
          </Box>
        );
      }

      return (
        <>
          {isMarkdown && (
            <>
              <TableCell align="center">
                <Button
                  variant="contained"
                  color="success"
                  href={`${baseViewUrl}${postNameWithoutExt}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditPost(post)}
                >
                  Edit
                </Button>
              </TableCell>
            </>
          )}
          <TableCell align="center">
            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmDelete(post)}
            >
              Delete
            </Button>
          </TableCell>
        </>
      );
    },
    [isMobile, baseViewUrl, handleEditPost]
  );

  useEffect(() => {
    getPostList();
  }, [getPostList]);

  if (isLoading) return <LoadingComponent />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        p: isMobile ? 1 : 3,
        width: "100%",
        overflowX: "auto",
      }}
    >
      <TextField
        placeholder="Search posts"
        sx={{
          mb: 2,
          width: "100%",
          bgcolor: "white",
        }}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {isSearching && <CircularProgress size={20} />}
            </InputAdornment>
          ),
        }}
      />
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          mb: 2,
          textAlign: isMobile ? "center" : "right",
          color: "black",
        }}
      >
        Total: {postList?.length} posts
      </Typography>

      {isSearching ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Box>
              {postList.map((post) => (
                <Paper
                  key={post.sha}
                  sx={{
                    p: 2,
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Typography variant="h6">
                    <a
                      href={post.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1976d2", textDecoration: "none" }}
                    >
                      {post.name}
                    </a>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                  {renderPostActions(post)}
                </Paper>
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Last Updated</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>View Details</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Live Edit</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {postList.map((post) => (
                    <TableRow key={post.sha}>
                      <TableCell>
                        <a
                          href={post.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#1976d2",
                            textDecoration: "none",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                          }}
                        >
                          {post.name}
                        </a>
                      </TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      {renderPostActions(post)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the post "{confirmDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts;
