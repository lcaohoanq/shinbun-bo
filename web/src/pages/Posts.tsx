import {
  Box,
  Button,
  CircularProgress,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPostContent, githubApi } from "../api";
import LoadingComponent from "../components/LoadingComponent";
import SearchPost from "../components/SearchPost";
import { PostDetail, PostList } from "../types/post.type";

// Cache for markdown content
const contentCache = new Map<string, string>();

// Interface for post with timestamp
interface PostExtend extends PostDetail {
  createdAt: string;
  draft: boolean;
  content?: string;
  path: string;
}

const Posts = () => {
  const [postList, setPostList] = useState<PostExtend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PostExtend | null>(null);
  const [originalPosts, setOriginalPosts] = useState<PostExtend[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoize the base URL for post viewing
  const baseViewUrl = useMemo(() => "https://shinbun.vercel.app/posts/", []);

  const getPostExtendProps = async (
    post: PostDetail
  ): Promise<PostExtend[]> => {
    try {
      // If it's a directory, fetch its contents
      if (post.type === "dir") {
        const dirResponse = await githubApi.get<PostList>(
          `/contents/${post.path}`
        );
        const dirContents = await Promise.all(
          dirResponse.data.map((item) => getPostExtendProps(item))
        );
        return dirContents.flat();
      }

      // Only process markdown files
      if (!post.name.endsWith(".md")) {
        return [];
      }

      const [commitResponse, content] = await Promise.all([
        githubApi.get(`/commits`, {
          params: {
            path: post.path,
            per_page: 1,
          },
        }),
        getPostContent(post.path),
      ]);

      // Cache the content with the full path
      contentCache.set(post.path, content);

      const frontMatter = content.split("---")[1];
      const draftMatch = frontMatter.match(/draft:\s*(true|false)/);
      const draft = draftMatch ? draftMatch[1] === "true" : false;

      return [
        {
          ...post,
          createdAt:
            commitResponse.data[0]?.commit?.author?.date ||
            new Date().toISOString(),
          draft,
          content,
          path: post.path,
        },
      ];
    } catch (err) {
      console.error(`Failed to fetch data for ${post.name}`, err);
      return [
        {
          ...post,
          createdAt: new Date().toISOString(),
          draft: false,
          path: post.path,
        },
      ];
    }
  };

  const getPostList = useCallback(async () => {
    try {
      setError(null);
      const response = await githubApi.get<PostList>(
        "/contents/src/content/posts"
      );

      if (response.status === 200) {
        // Process all items, including directories
        const allPosts = await Promise.all(
          response.data.map((item) => getPostExtendProps(item))
        );

        // Flatten the array and sort by creation time
        const sortedPosts = allPosts
          .flat()
          .sort(
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
        `/contents/${confirmDelete.path}`,
        {
          data: {
            message: `Deleting post ${confirmDelete.name}`,
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
        contentCache.delete(confirmDelete.path);
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
    (post: PostExtend) => {
      try {
        setError(null);
        const cachedContent = contentCache.get(post.path);

        if (cachedContent) {
          // Extract post name without extension and directory path
          const postPath = post.path
            .replace("src/content/posts/", "")
            .replace(".md", "");
          navigate(`/posts/${postPath}`, {
            state: {
              markdown: cachedContent,
              title: post.name.replace(".md", ""),
              path: post.path,
            },
          });
        } else {
          console.error(`No cached content found for ${post.path}`);
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
    (post: PostExtend) => {
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
                  href={`${baseViewUrl}${postNameWithoutExt}/${postNameWithoutExt}`}
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
                  href={`${baseViewUrl}${postNameWithoutExt}/${postNameWithoutExt}`}
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
      <SearchPost handleSearch={handleSearch} isSearching={isSearching} />
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
                      <strong>Is Draft</strong>
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
                      <TableCell
                        sx={
                          post.draft
                            ? { fontWeight: "bold", color: "error.main" }
                            : { fontWeight: "bold", color: "success.main" }
                        }
                      >
                        {post.draft ? "Yes" : "No"}
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
