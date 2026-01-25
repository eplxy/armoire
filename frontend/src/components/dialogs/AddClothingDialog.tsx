import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadClothingItem } from "../../hooks/queries/clothingQueries";
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddClothingDialog(props: Props) {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp"],
      },
      maxFiles: 1,
    });
  const uploadMutation = useUploadClothingItem();

  // Automatically trigger upload when a file is selected/dropped
  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const formData = new FormData();
      formData.append("image", acceptedFiles[0]);
      uploadMutation.mutate(formData, {
        onSuccess: (data) => {
          console.log("Upload successful:", data);
          setIsSuccess(true);
          queryClient.refetchQueries({ queryKey: ["clothing", "stats"] });
          queryClient.refetchQueries({ queryKey: ["clothing", "search"] });
        },
        onError: (error) => {
          console.error("Upload failed:", error);
        },
      });
    }
  }, [acceptedFiles]);

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle sx={{ display: "flex", justifyContent: "center" }}>
        Add clothing
      </DialogTitle>
      <DialogContent>
        {acceptedFiles.length === 0 &&
          !uploadMutation.isPending &&
          !isSuccess && (
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
                Drag and drop an image to upload your clothes, or click to
                select files
              </Typography>
            </Stack>
          )}

        {uploadMutation.isPending && (
          <Stack alignItems={"center"} gap={2}>
            <Typography color="primary.main" sx={{ mt: 2 }}>
              Upload and analysis in progress...
            </Typography>
            <CircularProgress />
          </Stack>
        )}

        {isSuccess && (
          <Stack alignItems={"center"} gap={2}>
            <Typography color="success.main" sx={{ mt: 2 }}>
              Clothing article added successfully!
            </Typography>

            <Box gap={2} sx={{ display: "flex" }}>
              <Button variant="contained" onClick={() => props.onClose()}>
                Done
              </Button>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
}
