import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { useLoadUserData } from "../hooks/useAuthentication";
import useUserStore from "../stores/userStore";
import { PieChart } from "@mui/x-charts/PieChart";

export default function IndexView() {
  useLoadUserData();
  const user = useUserStore((state) => state.user);

  return (
    <Paper sx={{ borderRadius: 8, p: 4, boxShadow: 2, height: "100%" }}>
      <Grid container height="100%" display="flex" gap={2}>
        <Grid size={5} sx={{ height: "100%" }}>
          <Stack>
            <Typography fontFamily={"ui-serif"} fontStyle="italic" variant="h6">
              Your wardrobe at a glance:
            </Typography>
          </Stack>
        </Grid>
        <Grid size={"grow"} sx={{ height: "100%" }}>
          <Stack>
            <Box
              sx={{
                backgroundColor: "background.default",
                borderRadius: 4,
                p: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <PieChart
                series={[
                  {
                    data: [
                      { id: 0, value: 10, label: "series A" },
                      { id: 1, value: 15, label: "series B" },
                      { id: 2, value: 20, label: "series C" },
                    ],
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    highlightScope: { fade: 'global', highlight: 'item' },
                  },
                ]}
                width={200}
                height={200}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
