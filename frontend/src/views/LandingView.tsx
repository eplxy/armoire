import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import Header from "../components/Header";
import "@/styles/landing.less";
import spotlight from "@/assets/spotlight.png";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsightsIcon from "@mui/icons-material/Insights";
import StyleIcon from "@mui/icons-material/Style";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PaletteIcon from "@mui/icons-material/Palette";
import { useNavigate } from "react-router";

import Lenis from "lenis";
import { useAuthentication } from "../hooks/useAuthentication";

const features = [
  {
    icon: <CheckroomIcon sx={{ fontSize: 48 }} />,
    title: "Smart Catalog",
    description:
      "Digitize your entire wardrobe with AI-powered image recognition and automatic categorization.",
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
    title: "AI Styling",
    description:
      "Get personalized outfit recommendations based on your style preferences, weather, and occasions.",
  },
  {
    icon: <InsightsIcon sx={{ fontSize: 48 }} />,
    title: "Wardrobe Analytics",
    description:
      "Track your most-worn items, identify gaps in your collection, and optimize your closet.",
  },
  {
    icon: <StyleIcon sx={{ fontSize: 48 }} />,
    title: "Outfit Planning",
    description:
      "Create and save outfit combinations for any occasion, from casual to formal.",
  },
  {
    icon: <CloudUploadIcon sx={{ fontSize: 48 }} />,
    title: "Cloud Storage",
    description:
      "Access your wardrobe from anywhere with secure cloud storage and sync across devices.",
  },
  {
    icon: <PaletteIcon sx={{ fontSize: 48 }} />,
    title: "Color Analysis",
    description:
      "Discover which colors complement each other and get suggestions based on color theory.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload Your Clothes",
    description:
      "Take photos of your clothing items or upload existing images from your device.",
  },
  {
    number: "02",
    title: "AI Categorization",
    description:
      "Our AI automatically identifies, tags, and organizes each item by type, color, and style.",
  },
  {
    number: "03",
    title: "Get Styled",
    description:
      "Receive personalized outfit suggestions and style recommendations tailored to you.",
  },
];

export default function LandingView() {
  const lenis = new Lenis();
  lenis.on("scroll", (e) => {
    console.log(e);
  });
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const { isLoggedIn } = useAuthentication();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Stack sx={{ maxWidth: "100vw", px: 8, gap: 8, pb: 8 }}>
        {/* Hero Section */}
        <Paper sx={{ borderRadius: 8, boxShadow: 2, height: "auto" }}>
          <Grid container height="100%" display="flex" gap={2}>
            <Grid
              p={4}
              size={5}
              height="100%"
              display={"flex"}
              alignContent="flex-end"
            >
              <Stack gap={3}>
                <Typography variant="h4" fontFamily={"ui-serif"} gutterBottom>
                  Welcome to Armoire
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Your personal wardrobe assistant powered by AI. Organize,
                  analyze, and style your clothing collection with ease.
                </Typography>
                <Stack direction="row" gap={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() =>
                      navigate(isLoggedIn ? "/clothing" : "/register")
                    }
                  >
                    {isLoggedIn ? "Go to Wardrobe" : "Get Started"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() =>
                      document
                        .getElementById("features")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Learn More
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid
              size={"grow"}
              height="100%"
              display={"flex"}
              alignItems="flex-end"
            >
              <img
                src={spotlight}
                alt="Spotlight"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  borderRadius: "0 32px 32px 0",
                }}
              ></img>
            </Grid>
          </Grid>
        </Paper>

        {/* Features Section */}
        <Box id="features">
          <Stack gap={6} alignItems="center">
            <Stack alignItems="center" gap={2} textAlign="center">
              <Typography variant="h3" fontFamily={"ui-serif"}>
                Powerful Features
              </Typography>
              <Typography variant="h6" color="text.secondary" maxWidth="600px">
                Everything you need to manage your wardrobe like a professional
                stylist
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Card
                    sx={{
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Stack gap={2}>
                        <Box sx={{ color: "primary.main" }}>{feature.icon}</Box>
                        <Typography variant="h5" fontFamily={"ui-serif"}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Box>

        {/* How It Works Section */}
        <Box>
          <Stack gap={6} alignItems="center">
            <Stack alignItems="center" gap={2} textAlign="center">
              <Typography variant="h3" fontFamily={"ui-serif"}>
                How It Works
              </Typography>
              <Typography variant="h6" color="text.secondary" maxWidth="600px">
                Get started in three simple steps
              </Typography>
            </Stack>

            <Grid container spacing={4}>
              {steps.map((step, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Paper
                    sx={{
                      p: 4,
                      height: "100%",
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -20,
                        left: -20,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: 4,
                      }}
                    >
                      <Typography variant="h4" color="white" fontWeight="bold">
                        {step.number}
                      </Typography>
                    </Box>
                    <Stack gap={2} pt={3}>
                      <Typography variant="h5" fontFamily={"ui-serif"}>
                        {step.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Box>

        {/* CTA Section */}
        <Paper
          sx={{
            p: 8,
            borderRadius: 8,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            textAlign: "center",
          }}
        >
          <Stack gap={3} alignItems="center">
            <Typography variant="h3" fontFamily={"ui-serif"}>
              Ready to Transform Your Wardrobe?
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="700px">
              Join thousands of users who have already organized their closets
              and discovered their personal style with Armoire.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ px: 6, py: 2, fontSize: "1.1rem" }}
              onClick={() => navigate(isLoggedIn ? "/clothing" : "/register")}
            >
              {isLoggedIn ? "Go to My Wardrobe" : "Start Free Today"}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </>
  );
}
