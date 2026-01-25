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

const drawerWidth = 240;

interface LayoutProps {}

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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* --- HEADER (APPBAR) --- */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1, // Header sits on top of Drawer
          bgcolor: "primary.main",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{ mr: 2, display: { sm: "none" } }} // Show hamburger only on mobile
            >
              <MenuIcon />
            </IconButton>

            <ArmoireLogo />
          </Box>

          <UserAvatar name={user.name} />
        </Toolbar>
      </AppBar>

      {/* --- SIDEBAR (DRAWER) --- */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
          display: { xs: "none", sm: "block" },
        }}
      >
        <Toolbar /> {/* Spacer to push content down below AppBar */}
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path} // Highlight active route
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      "&:hover": {
                        bgcolor: "primary.main",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        location.pathname === item.path ? "inherit" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* --- MAIN CONTENT AREA --- */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
