import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import ArmoireLogo from "../components/generic/ArmoireLogo";

export default function NotFoundView(props: { headerless?: boolean }) {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: props.headerless ? "100vh" : "calc(100vh - 134px)",
        textAlign: "center",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <ArmoireLogo />
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "4rem", md: "6rem" },
          fontWeight: 700,
          mb: 2,
        }}
      >
        404
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 500,
        }}
      >
        Page Not Found
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 500 }}
      >
        The page you're looking for doesn't exist or has been moved.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button variant="contained" size="large" onClick={() => navigate("/")}>
          Go Home
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Container>
  );
}
