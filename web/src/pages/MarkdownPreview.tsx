import GitHubIcon from "@mui/icons-material/GitHub";
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  Grid,
  IconButton,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { Base64 } from "js-base64";
import { marked, MarkedOptions } from "marked";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { githubApi } from "../api";
import NavigateButton from "../components/NavigateButton";
import { defaultMarkdown } from "../contents/example";
import { GITHUB_TOKEN } from "../environments/utils";
import { PostContent, PostMetaData } from "../types/post.type";
import PostMeta from "../components/PostMeta";

interface ExtendedMarkedOptions extends MarkedOptions {
  highlight?: (code: string, lang: string) => string;
}

const options: ExtendedMarkedOptions = {
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    return hljs.highlight(lang, code).value;
  },
};

const MarkdownPreview = () => {
  const { postTitle } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [postContent, setPostContent] = useState<PostContent>();
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const [metaData, setMetaData] = useState<PostMetaData>({
    title: "",
    published: "",
    description: "",
    image: "",
    tags: "",
    category: "",
    draft: "",
    lang: "",
  });
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const isTyping = useRef(false); // New flag to prevent scroll during typing

  const handleScroll = (
    sourceRef: React.RefObject<HTMLElement>,
    targetRef: React.RefObject<HTMLElement>
  ) => {
    if (isTyping.current) return; // Prevent syncing scroll during typing

    const sourceScrollElement =
      sourceRef.current?.querySelector("textarea") || sourceRef.current;
    const targetScrollElement = targetRef.current;

    if (sourceScrollElement && targetScrollElement) {
      const sourceScrollTop = sourceScrollElement.scrollTop;
      const sourceScrollHeight = sourceScrollElement.scrollHeight;
      const sourceClientHeight = sourceScrollElement.clientHeight;

      const targetScrollHeight = targetScrollElement.scrollHeight;
      const targetClientHeight = targetScrollElement.clientHeight;

      if (
        sourceScrollTop > 0 &&
        sourceScrollTop < sourceScrollHeight - sourceClientHeight
      ) {
        const scrollPercentage =
          sourceScrollTop / (sourceScrollHeight - sourceClientHeight);

        targetScrollElement.scrollTop =
          scrollPercentage * (targetScrollHeight - targetClientHeight);
      }
    }
  };

  const syncScrollOnInput = () => {
    isTyping.current = true;
    setTimeout(() => {
      isTyping.current = false; // Allow scroll sync after typing is done
    }, 100);
  };

  const {
    markdown: initialMarkdown = defaultMarkdown,
    title: initialTitle = postTitle || "",
    sha: postSha,
  } = location.state || {};

  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [title, setTitle] = useState<string>(initialTitle);

  const handleMetaSubmit = (data: PostMetaData) => {
    setMetaData(data);
    const frontMatter = `---
title: ${data.title}
published: ${data.published}
description: ${data.description}
image: ${data.image}
tags: ${data.tags}
category: ${data.category}
draft: ${data.draft}
lang: ${data.lang}
---\n\n`;

    setMarkdown(frontMatter + markdown.replace(/---[\s\S]*?---\n\n/, ""));
    setIsMetaOpen(false);
  };

  const extractMetaData = (content: string) => {
    const frontMatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      const meta: Partial<PostMetaData> = {};

      frontMatter.split("\n").forEach((line) => {
        const [key, ...values] = line.split(":");
        const value = values.join(":").trim();
        if (key && value) {
          meta[key.trim() as keyof PostMetaData] = value;
        }
      });

      setMetaData(meta as PostMetaData);
    }
  };

  const getPostMeta = async () => {
    if (postTitle === "new") return;

    try {
      const res = await githubApi.get<PostContent>(
        `/contents/src/content/posts/${postTitle}.md`
      );
      setPostContent(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (initialTitle) {
      setTitle(initialTitle);
    }
    getPostMeta();
  }, [initialTitle]);

  useEffect(() => {
    if (markdown) {
      extractMetaData(markdown);
    }
  }, []);

  marked.setOptions(options);

  const uploadPostMutation = useMutation({
    mutationFn: async ({
      title,
      markdown,
      sha,
    }: {
      title: string;
      markdown: string;
      sha?: string;
    }) => {
      const res = await githubApi.put(
        `/contents/src/content/posts/${title}.md`,
        {
          message: sha ? `Update post: ${title}` : `Add new post: ${title}`,
          content: Base64.encode(markdown),
          sha: postContent?.sha,
        },
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Upload failed", error);
    },
  });

  const handleUpload = () => {
    uploadPostMutation.mutate({
      title: title.trim(),
      markdown,
      sha: postSha,
    });
  };

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [markdown]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static" className="mb-8">
        <Toolbar>
          <NavigateButton to="/dashboard" />
          <Typography variant="h6" className="flex-grow">
            Markdown Previewer
          </Typography>
          <IconButton
            color="inherit"
            href="https://github.com/lcaohoanq/shinbun"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} className="mt-8">
        <Box className="flex gap-3 mb-3">
          <TextField
            fullWidth
            label="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            className="mb-4"
          />
          <Button
            variant="contained"
            color="warning"
            onClick={() => setIsMetaOpen(true)}
          >
            Post Meta
          </Button>
          <Button
            variant="contained"
            color="primary"
            style={{ float: "right" }}
            onClick={handleUpload}
            disabled={uploadPostMutation.isPending}
          >
            {uploadPostMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </Box>
        <Dialog
          open={isMetaOpen}
          onClose={() => setIsMetaOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <PostMeta
            initialData={metaData}
            onSubmit={handleMetaSubmit}
            onCancel={() => setIsMetaOpen(false)}
          />
        </Dialog>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="h-full">
              <Typography variant="h6" className="p-4 bg-gray-100 border-b">
                Markdown Input
              </Typography>
              <TextField
                inputRef={inputRef}
                multiline
                fullWidth
                variant="outlined"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onKeyDown={syncScrollOnInput} // Track typing events
                onScroll={() => handleScroll(inputRef, previewRef)} // Sync scroll manually
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
                ref={previewRef}
                className="markdown-body p-4 h-[calc(100vh-250px)] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: marked(markdown) }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default MarkdownPreview;
