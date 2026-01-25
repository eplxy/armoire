import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import Header from "../components/Header";
import "@/styles/landing.less";

import Lenis from "lenis";
import { useAuthentication } from "../hooks/useAuthentication";
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

  return (
    <>
      <Header />
      <Stack sx={{ maxWidth: "100vw", px: 8, gap: 4 }}>
        <Paper sx={{ borderRadius: 8, p: 4, boxShadow: 2, height: "900px" }}>
          <Grid container>
            <Grid size={7}>some text</Grid>

            <Grid size={"auto"}>some more text</Grid>
          </Grid>
        </Paper>
      </Stack>
    </>
  );
}
