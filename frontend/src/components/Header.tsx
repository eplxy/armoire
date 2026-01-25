import { Avatar, Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import ArmoireLogo from "./generic/ArmoireLogo";
import { useAuthentication, useLoadUserData } from "../hooks/useAuthentication";
import { stringAvatar } from "../utils/avatarUtils";
import useUserStore from "../stores/userStore";
import UserAvatar from "./generic/UserAvatar";

type HeaderProps = {
  logoTo?: string;
};

export default function Header(props: HeaderProps) {
  useLoadUserData();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthentication();

  const user = useUserStore((state) => state.user);

  return (
    <Box
      sx={{
        top: 0,
        position: "sticky",
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: { xs: "60px", sm: "70px", md: "80px" },
          px: { xs: 2, sm: 3, md: 4 },
          mx: { xs: 2, sm: 4, md: 8 },
          //   my: 4,
          borderRadius: { xs: 4, md: 8 },
          boxShadow: 2,
          backgroundColor: "background.paper",
        }}
      >
        <ArmoireLogo to={props.logoTo} />
        {isLoggedIn ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                py: 1,
                px: 2,
                borderRadius: 4,
              }}
              onClick={() => navigate("/")}
            >
              Open app
            </Button>
            <UserAvatar name={user.name} />
          </Box>
        ) : (
          <Box>
            <Button
              color="primary"
              onClick={() => navigate("/login")}
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                px: { xs: 1.5, sm: 2 },
              }}
            >
              login
            </Button>
            <Button
              onClick={() => navigate("/register")}
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                px: { xs: 1.5, sm: 2 },
              }}
            >
              register
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
