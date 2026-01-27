import LockOutlineIcon from "@mui/icons-material/LockOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "react-router";
import {
  useGetClothingItem,
  useGetClothingOwnerName,
  useUpdateClothingItem,
} from "../hooks/queries/clothingQueries";
import NotFoundView from "./NotFoundView";
import { useEffect, useState } from "react";
import { useLoadUserData } from "../hooks/useAuthentication";
import useUserStore from "../stores/userStore";
import { useQueryClient } from "@tanstack/react-query";

export default function ArticleView() {
  useLoadUserData();
  const user = useUserStore((state) => state.user);
  const { clothingId } = useParams<{ clothingId: string }>();
  const queryClient = useQueryClient();

  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [editedVisibility, setEditedVisibility] = useState<boolean>(false);

  const itemQuery = useGetClothingItem(clothingId || "");
  const item = itemQuery.data;

  const ownerName = useGetClothingOwnerName(clothingId || "").data;
  const updateMutation = useUpdateClothingItem();

  

  useEffect(() => {
    if (itemQuery.isSuccess && item) {
      setIsPublic(item.isPublic ?? false);
      setEditedName(item.name || "");
      setEditedDescription(item.description || "");
      setEditedVisibility(item.isPublic ?? false);
    }
  }, [itemQuery.isSuccess, item]);

  if (!itemQuery.isLoading && itemQuery.isError) {
    return <NotFoundView />;
  }
  const handlePublicToggle = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    setEditedVisibility(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset values
      setEditedName(item?.name || "");
      setEditedDescription(item?.description || "");
      setEditedVisibility(item?.isPublic ?? false);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (clothingId) {
      await updateMutation.mutateAsync(
        {
          id: clothingId,
          name: editedName,
          description: editedDescription,
          isPublic: editedVisibility,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["clothing", clothingId],
            });
            setIsEditing(false);
          },
        },
      );
    }
  };

  const isOwner = user.id === item?.userId;

  return (
    <Grid
      container
      height="100%"
      display="flex"
      gap={2}
      flexDirection={{ xs: "column", md: "row" }}
    >
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{ height: { xs: "auto", md: "100%" } }}
      >
        <Paper
          sx={{
            borderRadius: 8,
            p: { xs: 2, md: 4 },
            boxShadow: 2,
            height: { xs: "auto", md: "100%" },
            overflow: "auto",
          }}
        >
          <img
            src={item?.imageUrl}
            alt={item?.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </Paper>
      </Grid>

      <Grid
        sx={{ height: { xs: "auto", md: "100%" } }}
        size={{ xs: 12, md: "grow" }}
      >
        <Paper
          sx={{
            height: { xs: "auto", md: "100%" },
            borderRadius: 8,
            p: { xs: 2, md: 4 },
            boxShadow: 2,
            position: "relative",
          }}
        >
          <Stack spacing={3}>
            <Box
              display="flex"
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack flex={1}>
                {isEditing ? (
                  <TextField
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="Clothing name"
                    sx={{ mb: 1, width: "90%" }}
                  />
                ) : (
                  <Typography variant="h4" fontFamily={"ui-serif"}>
                    {item?.name || "Clothing Item"}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary">
                  from {ownerName || "Unknown Owner"}'s closet
                </Typography>
              </Stack>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isOwner && (
                  <>
                    {isEditing ? (
                      <>
                        <Tooltip title="Save changes">
                          <IconButton
                            onClick={handleSave}
                            color="primary"
                            disabled={updateMutation.isPending}
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel changes">
                          <IconButton
                            onClick={handleEditToggle}
                            disabled={updateMutation.isPending}
                          >
                            <CancelIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <IconButton onClick={handleEditToggle} color="primary">
                        <EditIcon />
                      </IconButton>
                    )}
                  </>
                )}
                {isOwner && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {editedVisibility ? (
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          Public
                        </Typography>
                        <LockOpenIcon color="primary" />
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          Private
                        </Typography>
                        <LockOutlineIcon color="disabled" />
                      </>
                    )}
                    <Switch
                      checked={editedVisibility ?? false}
                      onChange={handlePublicToggle}
                      disabled={!isEditing || updateMutation.isPending}
                    />
                  </Box>
                )}
              </Box>
            </Box>
            {isEditing ? (
              <TextField
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                variant="outlined"
                size="small"
                placeholder="Description"
                multiline
                rows={3}
                fullWidth
              />
            ) : (
              <Typography variant="body1" color="text.secondary">
                {item?.description || "No description available."}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              <strong>Category:</strong> {item?.category || "Unknown"}
            </Typography>
            {item?.subCategory && (
              <Typography variant="body2" color="text.secondary">
                <strong>Sub-category:</strong> {item.subCategory}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              <strong>{`Color${!!item?.colors && item.colors.length > 1 ? "s" : ""}`}</strong>{" "}
              {item?.colors?.join(", ") || "Unknown"}
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
