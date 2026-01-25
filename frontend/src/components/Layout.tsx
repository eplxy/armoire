import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";

// Icons
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"; // Add Item
import CheckroomIcon from "@mui/icons-material/Checkroom"; // Closet
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search"; // Search
import StyleIcon from "@mui/icons-material/Style"; // Outfits
import { useLoadUserData } from "../hooks/useAuthentication";
import useUserStore from "../stores/userStore";
import ArmoireLogo from "./generic/ArmoireLogo";
import UserAvatar from "./generic/UserAvatar";
import Header from "./Header";

const drawerWidth = 240;

interface LayoutProps {
  children?: React.ReactNode;
  unlockHeight?: boolean;
}

export default function Layout(props: LayoutProps) {
  useLoadUserData();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Items Configuration
  const menuItems = [
    { text: "My Closet", icon: <CheckroomIcon />, path: "/closet" },
    { text: "Add Item", icon: <AddPhotoAlternateIcon />, path: "/add" },
    { text: "Outfits", icon: <StyleIcon />, path: "/outfits" },
    { text: "Search", icon: <SearchIcon />, path: "/search" },
  ];

  return (
    <Stack sx={{ display: "flex" }}>
      <CssBaseline />

      <Header layout nonStick />
      <Box
        component="main"
        sx={{
          mx: { xs: 2, sm: 4, md: 8 },
          pb: 4,
          flexGrow: 1,
          bgcolor: "background.default",
          height:
            props.children && props.unlockHeight
              ? {xs: "auto" , md: "calc(100vh - 134px)"}
              : "calc(100vh - 134px)",
        }}
      >
        {props.children ? props.children : <Outlet />}
      </Box>
    </Stack>
  );
}
