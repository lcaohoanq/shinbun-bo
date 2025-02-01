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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingComponent from "../components/LoadingComponent";
import { PostDetail, PostList } from "../types/post.type";
import { githubApi } from "../api";

// Cache for markdown content
const markdownCache = new Map<string, string>();

const Posts = () => {
  const [postList, setPostList] = useState<PostList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PostDetail | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoize the base URL for post viewing
  const baseViewUrl = useMemo(() => "https://shinbun.vercel.app/posts/", []);

  const getPostList = useCallback(async () => {
    try {
      setError(null);
      const response = await githubApi.get<PostList>(
        "/contents/src/content/posts"
      );
      if (response.status === 200) {
        setPostList(response.data);
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
    async (post: PostDetail) => {
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

  // Memoize post actions renderer to prevent unnecessary re-renders
  const renderPostActions = useCallback(
    (post: PostDetail) => {
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
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          mb: 2,
          textAlign: isMobile ? "center" : "left",
          color: "black",
        }}
      >
        Total: {postList?.length} posts
      </Typography>

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
                  {renderPostActions(post)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
