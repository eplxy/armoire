import { Avatar, Box, Button, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import ArmoireLogo from "./generic/ArmoireLogo";
import { useAuthentication, useLoadUserData } from "../hooks/useAuthentication";
import { stringAvatar } from "../utils/avatarUtils";
import useUserStore from "../stores/userStore";
import UserAvatar from "./generic/UserAvatar";

type HeaderProps = {
  logoTo?: string;
  nonStick?: boolean;
  layout?: boolean;
};

export default function Header(props: HeaderProps) {
  useLoadUserData();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthentication();

  const user = useUserStore((state) => state.user);

  const navItems = [
    { text: "home", path: "/" },
    { text: "clothes", path: "/clothing" },
    { text: "outfits", path: "/outfits" },
  ];

  const showNavItems = isLoggedIn && props.layout;

  return (
    <Box
      sx={{
        top: 0,
        position: props.nonStick ? "relative" : "sticky",
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: { xs: "70px" },
          px: { xs: 2, sm: 3, md: 4 },
          mx: { xs: 2, sm: 4, md: 8 },
          borderRadius: { xs: 4, md: 8 },
          boxShadow: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ArmoireLogo to={props.logoTo} />
          {showNavItems && (
            <Box gap={2}>
              {navItems.map((item) => (
                <Button
                  disableRipple
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1.125rem" },
                    px: { xs: 1, sm: 2 },
                    mt: 0.5,
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "text.primary",
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {!props.layout ? (
          isLoggedIn ? (
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
          )
        ) : (
          <UserAvatar name={user.name} />
        )}
      </Box>
    </Box>
  );
}
