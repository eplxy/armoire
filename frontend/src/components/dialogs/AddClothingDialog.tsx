import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddClothingDialog(props: Props) {
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp"],
      },
    });

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle sx={{ display: "flex", justifyContent: "center" }}>
        Add clothing
      </DialogTitle>
      <DialogContent >
        <Stack
          sx={{
            color: isDragActive ? "primary.main" : "text.secondary",
            border: isDragActive ? "2px dashed" : "2px dashed #ccc",
            borderColor: isDragActive ? "primary.main" : undefined,
            backgroundColor: isDragActive ? "primary.light" : undefined,
            width: { xs: 250, md: 400 },
            height: { xs: 150, md: 200 },
            display: "flex",
            p: 4,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 2,
            transition: "all 0.3s ease",
          }}
          {...getRootProps()}
          className="dropzone"
        >
          <input {...getInputProps()} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FileUploadIcon fontSize="large" />
            <ImageSearchIcon fontSize="large" />
          </Box>
          <Typography>
            Drag and drop an image to upload your clothes, or click to select
            files
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
}
