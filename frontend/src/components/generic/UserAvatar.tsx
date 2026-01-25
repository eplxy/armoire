import {
  Avatar,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { stringAvatar } from "../../utils/avatarUtils";
import { useState } from "react";
import { logout } from "../../hooks/useAuthentication";
import Logout from "@mui/icons-material/Logout";

export type UserAvatarProps = {
  name: string;
};

export default function UserAvatar(props: UserAvatarProps) {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  return (
    <>
      <Avatar
        {...stringAvatar(props.name)}
        onClick={handleOpenUserMenu}
        sx={{ cursor: "pointer" }}
      />
      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography textAlign="center">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
