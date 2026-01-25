import { CheckCircle } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  Fab,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import AddClothingDialog from "../components/dialogs/AddClothingDialog";
import {
  useGetClothingStats,
  useSearchClothing,
} from "../hooks/queries/clothingQueries";
import { Link } from "react-router";
import type { ClothingItem } from "../models/models";

const CATEGORIES = [
  "Tops",
  "Dresses",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
];

const COLORS = [
  "Black",
  "White",
  "Grey",
  "Beige",
  "Brown",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Gold",
  "Silver",
  "Multi-colored",
];

const COLOR_MAP: Record<string, string> = {
  Black: "#222",
  White: "#FFFFFF",
  Grey: "#808080",
  Beige: "#E8DCC4",
  Brown: "#A67C52",
  Red: "#C67B7B",
  Blue: "#7BA3C6",
  Green: "#7BC67B",
  Yellow: "#D4C67B",
  Orange: "#D4A67B",
  Purple: "#A67BC6",
  Pink: "#D47BA3",
  Gold: "#D4B87B",
  Silver: "#C0C0C0",
  "Multi-colored":
    "linear-gradient(90deg, #C67B7B, #D4A67B, #D4C67B, #7BC67B, #7BA3C6, #8B7BA3, #A67BC6)",
};

export default function ClothingView() {
  const searchMutation = useSearchClothing();
  const clothingStatsQuery = useGetClothingStats();
  const [query, setQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [isAISearchActive, setIsAISearchActive] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const items: ClothingItem[] = useMemo(() => {
    if (searchMutation.isSuccess) {
      return searchMutation.data;
    }
    return [];
  }, [searchMutation.data, searchMutation.isSuccess]);

  const handleCategoryToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newCategories: string[],
  ) => {
    setSelectedCategories(newCategories);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const handleAISearchToggled = () => {
    setIsAISearchActive((prev) => !prev);
  };

  const triggerSearch = () => {
    searchMutation.mutate({
      query,
      categories: selectedCategories,
      colors: selectedColors,
      aiSearch: isAISearchActive,
    });
  };

  useEffect(() => {
    triggerSearch();
  }, []);

  return (
    <Grid
      container
      height="100%"
      display="flex"
      gap={2}
      flexDirection={{ xs: "column", md: "row" }}
    >
      <Grid
        size={{ xs: 12, md: 3 }}
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
          <Stack spacing={3}>
            <TextField
              helperText={isAISearchActive ? "Using AI to improve search" : ""}
              slotProps={{
                input: {
                  sx: { borderRadius: 4 },
                  endAdornment: (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip
                        title={`${isAISearchActive ? "Disable" : "Enable"} AI Search`}
                      >
                        <IconButton
                          sx={{
                            color: isAISearchActive ? "#9FB281" : "primary",
                          }}
                          onClick={handleAISearchToggled}
                        >
                          <AutoAwesomeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Search">
                        <IconButton onClick={triggerSearch}>
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ),
                },
              }}
              placeholder="Search for clothes"
              variant="outlined"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerSearch();
                }
              }}
            />

            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1">Categories</Typography>
                {selectedCategories.length > 0 && (
                  <Typography variant="subtitle1" color="text.secondary">
                    {`(Selected: ${selectedCategories.length})`}
                  </Typography>
                )}
              </Box>
              <ToggleButtonGroup
                value={selectedCategories}
                onChange={handleCategoryToggle}
                orientation="vertical"
                fullWidth
                size="small"
              >
                {CATEGORIES.map((category) => (
                  <ToggleButton
                    color={"primary"}
                    key={category}
                    value={category}
                    sx={{
                      justifyContent: "space-between",
                      textTransform: "none",
                      borderRadius: 2,
                      gap: 1,
                    }}
                  >
                    {category}

                    {selectedCategories.includes(category) && (
                      <CheckCircle fontSize="small" />
                    )}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>

            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1">Colors</Typography>
                {selectedColors.length > 0 && (
                  <Typography variant="subtitle1" color="text.secondary">
                    {`(Selected: ${selectedColors.length})`}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {COLORS.map((color) => {
                  const isSelected = selectedColors.includes(color);
                  const colorValue = COLOR_MAP[color];

                  return (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() => handleColorToggle(color)}
                      variant={isSelected ? "filled" : "outlined"}
                      icon={
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: colorValue,
                            border:
                              color === "White" ? "1px solid #ccc" : "none",
                          }}
                        />
                      }
                      sx={{
                        color: "rgba(0, 0, 0, 0.54)",
                        borderRadius: 2,
                        ...(isSelected && {
                          background:
                            color === "Multi-colored" ? colorValue : colorValue,
                          color: [
                            "White",
                            "Yellow",
                            "Beige",
                            "Gold",
                            "Silver",
                          ].includes(color)
                            ? "#000"
                            : "#fff",
                          "&:hover": {
                            background:
                              color === "Multi-colored"
                                ? colorValue
                                : colorValue,
                            filter: "brightness(0.9)",
                          },
                        }),
                      }}
                    />
                  );
                })}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      <Grid
        sx={{ height: { xs: "auto", md: "100%" } }}
        size={{ xs: 12, md: "grow" }}
      >
        <Paper
          sx={{
            height: { xs: "500px", md: "100%" },
            borderRadius: 8,
            p: { xs: 2, md: 4 },
            boxShadow: 2,
            position: "relative",
          }}
        >
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {searchMutation.isSuccess &&
              searchMutation.data.length > 0 &&
              items.map((item) => (
                <Link to={`/clothing/${item.id}`} key={item.id}>
                  <Box sx={{ width: 160, height: 160 }}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Link>
              ))}
            {searchMutation.isPending &&
              clothingStatsQuery.data !== undefined &&
              Array.from({ length: clothingStatsQuery.data.totalItems }).map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width={160}
                    height={160}
                    sx={{ marginRight: 1, marginBottom: 1 }}
                  />
                ),
              )}
          </Stack>

          {searchMutation.isSuccess && searchMutation.data.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                py: 8,
              }}
            >
              <CheckroomIcon
                sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }}
              />
              <Typography variant="h6" color="text.secondary">
                No clothing items found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {clothingStatsQuery.data?.totalItems === 0
                  ? "You have no clothing items. Start by adding some!"
                  : "Try adjusting your filters or search query"}
              </Typography>
            </Box>
          )}
          <Fab
            color="primary"
            size="medium"
            sx={{
              position: "absolute",
              bottom: { xs: 12, md: 16 },
              right: { xs: 12, md: 16 },
            }}
            onClick={() => setIsAddDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
          {isAddDialogOpen && ( // doing this remount and reset
            <AddClothingDialog
              open={isAddDialogOpen}
              onClose={() => setIsAddDialogOpen(false)}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
