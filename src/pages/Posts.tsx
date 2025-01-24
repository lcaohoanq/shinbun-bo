import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { GITHUB_TOKEN } from "../environments/utils";
import { PostDetail, PostList } from "../types/post.type";
import LoadingComponent from "../components/LoadingComponent";

const Posts = () => {
  const [postList, setPostList] = useState<PostList>([]); // Initialize with an empty array
  const [isLoading, setIsLoading] = useState(true);

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
        console.log(`Post list: ${JSON.stringify(response.data)}`);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (post: PostDetail) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirm) return;

    try {
      const res = await axios.delete(
        `https://api.github.com/repos/lcaohoanq/shinbun/contents/src/content/posts/${post.name}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
          data: {
            message: `Deleting post ${post.name.slice(0, -3)}`, // Commit message
            sha: post.sha,
          },
        }
      );
      if (res.status === 200) {
        console.log("Delete success");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPostList();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mt-8 mb-3">All My Posts</h2>
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <>
          <h2>Total: {postList?.length} posts</h2>
          {postList.length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>View Details</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Edit</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {postList.map((post: PostDetail) => (
                    <TableRow key={post.sha}>
                      <TableCell>
                        <a
                          href={post.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {post.name}
                        </a>
                      </TableCell>
                      {post.name.includes(".md") ? (
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="success"
                            style={{ margin: "5px" }}
                            href={`https://shinbun.vercel.app/posts/${post.name.slice(
                              0,
                              -3
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View On Page
                          </Button>
                        </TableCell>
                      ) : (
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="warning"
                            style={{ margin: "5px" }}
                          >
                            Is not a page
                          </Button>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="info"
                          style={{ margin: "5px" }}
                          onClick={() => {
                            console.log("first");
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="error"
                          style={{ margin: "5px" }}
                          onClick={() => {
                            handleDelete(post);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>No posts available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Posts;
