import { Grid, Paper, Stack } from "@mui/material";

export default function OutfitsView() {
  return (
    <Grid container height="100%" display="flex" gap={2}>
      <Grid size={3} sx={{ height: "100%" }}>
        <Paper sx={{ borderRadius: 8, p: 4, boxShadow: 2, height: "100%" }}>
          <Stack>Outfits coming soon (just not during Conuhacks sadly!)</Stack>
        </Paper>
      </Grid>

      <Grid sx={{ height: "100%" }} size={"grow"}>
        <Paper sx={{ height: "100%", borderRadius: 8, p: 4, boxShadow: 2 }}>
          <Stack></Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
