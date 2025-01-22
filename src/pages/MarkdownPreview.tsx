import { useEffect, useState } from "react";
import { marked, MarkedOptions } from "marked";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { defaultMarkdown } from "../contents/example";
import axios from "axios";
import { Base64 } from "js-base64";

interface ExtendedMarkedOptions extends MarkedOptions {
  highlight?: (code: string, lang: string) => string;
}

const options: ExtendedMarkedOptions = {
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    // Use highlight.js for syntax highlighting
    return hljs.highlight(lang, code).value;
  },
};

type UploadPostReqBody = {
  message: string;
  content: string;
};

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const token = import.meta.env.REACT_APP_GITHUB_TOKEN ?? "not found";

  // Configure marked options
  marked.setOptions(options);
  console.log("token", token);

  const uploadPost = async (markdown: string) => {
    const confirm = window.confirm(
      "Are you sure you want to upload this post?"
    );
    if (!confirm) return;

    await axios.put<UploadPostReqBody>(
      `https://api.github.com/repos/lcaohoanq/shinbun/contents/src/content/posts/hihi.md`,
      {
        message: "Add new post",
        content: Base64.encode(markdown),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  useEffect(() => {
    // Syntax highlight all code blocks after rendering
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });

    console.log("markdown", markdown);
  }, [markdown]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static" className="mb-8">
        <Toolbar>
          <Typography variant="h6" className="flex-grow">
            Markdown Previewer
          </Typography>
          <IconButton
            color="inherit"
            href="https://github.com/lcaohoanq"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className="mt-8">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="h-full">
              <Typography variant="h6" className="p-4 bg-gray-100 border-b">
                Markdown Input
              </Typography>
              <TextField
                multiline
                fullWidth
                variant="outlined"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="h-[calc(100vh-250px)]"
                InputProps={{
                  className: "h-full",
                  sx: {
                    "& .MuiInputBase-input": {
                      height: "100% !important",
                      overflowY: "auto !important",
                    },
                  },
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="h-full">
              <Typography variant="h6" className="p-4 bg-gray-100 border-b">
                Preview
              </Typography>
              <div
                className="prose max-w-none p-6 h-[calc(100vh-250px)] overflow-auto"
                dangerouslySetInnerHTML={{
                  __html: marked(markdown),
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        <Box mt={2}>
          <Button
            variant="contained"
            color="success"
            style={{ float: "right" }}
            onClick={() => uploadPost(markdown)}
          >
            Upload Post
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default MarkdownPreview;
