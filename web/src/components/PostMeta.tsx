import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

interface FormData {
  title: string;
  published: string;
  description: string;
  image: string;
  tags: string;
  category: string;
  draft: string;
  lang: string;
}

interface PostMetaProps {
  initialData: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const PostMeta: React.FC<PostMetaProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "title":
        if (!value.startsWith('"') || !value.endsWith('"')) {
          return "Title must be wrapped in double quotes";
        }
        break;

      case "published":
        {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            return "Date must be in YYYY-MM-DD format";
          }
        }
        break;

      case "description":
        if (
          (!value.startsWith("'") || !value.endsWith("'")) &&
          (!value.startsWith('"') || !value.endsWith('"'))
        ) {
          return "Description must be wrapped in single or double quotes";
        }
        break;

      case "image":
        if (!value.startsWith('"') || !value.endsWith('"')) {
          return "Image URL must be wrapped in double quotes";
        }
        if (!value.includes("https://")) {
          return "Must be a valid HTTPS URL";
        }
        break;

      case "tags":
        try {
          const tagsArray = JSON.parse(value.replace(/'/g, '"'));
          if (!Array.isArray(tagsArray)) {
            return "Tags must be an array";
          }
        } catch {
          return "Invalid array format";
        }
        break;

      case "category":
        if (
          (!value.startsWith("'") || !value.endsWith("'")) &&
          (!value.startsWith('"') || !value.endsWith('"'))
        ) {
          return "Category must be wrapped in single or double quotes";
        }
        break;

      case "draft":
        if (value !== "true" && value !== "false") {
          return "Draft must be true or false";
        }
        break;

      case "lang":
        if (!["en", "vi", "jp"].includes(value)) {
          return "Language must be 'en', 'vi', or 'jp'";
        }
        break;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = () => {
    const newErrors: Partial<FormData> = {};
    let hasErrors = false;

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key as keyof FormData] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      onSubmit(formData);
    }
  };

  return (
    <>
      <DialogTitle>Post Metadata</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "100%" },
            maxWidth: 600,
            mx: "auto",
            p: 2,
          }}
        >
          <TextField
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title || "Must be wrapped in double quotes"}
          />

          <TextField
            name="published"
            label="Published Date"
            value={formData.published}
            onChange={handleChange}
            error={!!errors.published}
            helperText={errors.published || "Format: YYYY-MM-DD"}
          />

          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={
              errors.description || "Must be wrapped in single or double quotes"
            }
          />

          <TextField
            name="image"
            label="Image URL"
            value={formData.image}
            onChange={handleChange}
            error={!!errors.image}
            helperText={
              errors.image || "Must be a valid HTTPS URL in double quotes"
            }
          />

          <TextField
            name="tags"
            label="Tags"
            value={formData.tags}
            onChange={handleChange}
            error={!!errors.tags}
            helperText={errors.tags || 'Enter as array, e.g., ["tag1", "tag2"]'}
          />

          <TextField
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            error={!!errors.category}
            helperText={
              errors.category || "Must be wrapped in single or double quotes"
            }
          />

          <TextField
            name="draft"
            label="Draft"
            value={formData.draft}
            onChange={handleChange}
            error={!!errors.draft}
            helperText={errors.draft || "Enter true or false"}
          />

          <TextField
            name="lang"
            label="Language"
            value={formData.lang}
            onChange={handleChange}
            error={!!errors.lang}
            helperText={errors.lang || "Enter 'en', 'vi', or 'jp'"}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </>
  );
};

export default PostMeta;
