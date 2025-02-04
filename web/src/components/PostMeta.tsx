import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { format, isValid } from "date-fns";
import React, { useEffect, useState } from "react";

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

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
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

  const handleDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setFormData((prev) => ({
        ...prev,
        published: formattedDate,
      }));

      const error = validateField("published", formattedDate);
      setErrors((prev) => ({
        ...prev,
        published: error,
      }));
    }
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
            "& .MuiFormControl-root": { m: 1, width: "100%" },
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
            fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Published Date"
              value={formData.published ? new Date(formData.published) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  error: !!errors.published,
                  helperText: errors.published || "Select a date",
                  sx: { width: "100%" },
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={
              errors.description || "Must be wrapped in single or double quotes"
            }
            fullWidth
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
            fullWidth
          />

          <TextField
            name="tags"
            label="Tags"
            value={formData.tags}
            onChange={handleChange}
            error={!!errors.tags}
            helperText={errors.tags || 'Enter as array, e.g., ["tag1", "tag2"]'}
            fullWidth
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
            fullWidth
          />

          <FormControl fullWidth error={!!errors.draft}>
            <InputLabel>Draft</InputLabel>
            <Select
              name="draft"
              value={formData.draft}
              label="Draft"
              onChange={handleChange}
            >
              <MenuItem value="false">False</MenuItem>
              <MenuItem value="true">True</MenuItem>
            </Select>
            {errors.draft && <FormHelperText>{errors.draft}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth error={!!errors.lang}>
            <InputLabel>Language</InputLabel>
            <Select
              name="lang"
              value={formData.lang}
              label="Language"
              onChange={handleChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="vi">Vietnamese</MenuItem>
              <MenuItem value="jp">Japanese</MenuItem>
            </Select>
            {errors.lang && <FormHelperText>{errors.lang}</FormHelperText>}
          </FormControl>
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
