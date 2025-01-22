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
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

const defaultMarkdown = `# React Markdown Previewer!

## This is a sub-heading...
    
Or... wait for it... **_both!_**
  
And feel free to go crazy ~~crossing stuff out~~.
      
There's also [links](https://www.example.com), and
> Block Quotes!
     
\`\`\`javascript
// Code blocks too!
function example() {
  return 'hello world';
}
\`\`\`
    
- And of course there are lists
  - Some are bulleted
     - With different indentation levels
        - Like this one
`;

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

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  // Configure marked options
  marked.setOptions(options);

  useEffect(() => {
    // Syntax highlight all code blocks after rendering
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
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
            href="https://github.com/yourusername"
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
      </Container>
    </div>
  );
};

export default MarkdownPreview;
