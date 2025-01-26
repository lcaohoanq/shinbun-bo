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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingComponent from "../components/LoadingComponent";
import { GITHUB_TOKEN } from "../environments/utils";
import { PostDetail, PostList } from "../types/post.type";

const Posts = () => {
  const [postList, setPostList] = useState<PostList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<PostDetail | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getPostList = async () => {
    try {
      const response = await axios.get<PostList>(
        `https://api.github.com/repos/lcaohoanq/shinbun/contents/src/content/posts`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        }
      );
      if (response.status === 200) {
        setPostList(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `https://api.github.com/repos/lcaohoanq/shinbun/contents/src/content/posts/${confirmDelete.name}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
          data: {
            message: `Deleting post ${confirmDelete.name.slice(0, -3)}`,
            sha: confirmDelete.sha,
          },
        }
      );
      if (res.status === 200) {
        setPostList(postList.filter((post) => post.sha !== confirmDelete.sha));
        setConfirmDelete(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEditPost = async (post: PostDetail) => {
    try {
      const res = await axios.get(
        `https://raw.githubusercontent.com/lcaohoanq/shinbun/main/src/content/posts/${post.name}`
      );

      if (res.status === 200) {
        const markdownContent = res.data;
        navigate(`/posts/${post.name.slice(0, -3)}`, {
          state: { markdown: markdownContent },
        });
      }
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  useEffect(() => {
    getPostList();
  }, []);

  const renderPostActions = (post: PostDetail) => {
    if (isMobile) {
      return (
        <Box display="flex" flexDirection="column" gap={1}>
          {post.name.includes(".md") && (
            <>
              <Button
                fullWidth
                variant="contained"
                color="success"
                href={`https://shinbun.vercel.app/posts/${post.name.slice(
                  0,
                  -3
                )}`}
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
        {post.name.includes(".md") && (
          <>
            <TableCell align="center">
              <Button
                variant="contained"
                color="success"
                href={`https://shinbun.vercel.app/posts/${post.name.slice(
                  0,
                  -3
                )}`}
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
  };

  if (isLoading) return <LoadingComponent />;

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
