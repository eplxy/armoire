import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { useLoadUserData } from "../hooks/useAuthentication";
import useUserStore from "../stores/userStore";
import { PieChart } from "@mui/x-charts/PieChart";
import { useGetClothingStats } from "../hooks/queries/clothingQueries";
import { BarChart } from "@mui/x-charts";
import { COLOR_MAP } from "./ClothingView";
import { useGetDashboardStylistMessage } from "../hooks/queries/dashboardQueries";

export default function IndexView() {
  useLoadUserData();
  const user = useUserStore((state) => state.user);
  const clothingStatsQuery = useGetClothingStats();
  const clothingStats = clothingStatsQuery.data;

  const dashboardStylistQuery = useGetDashboardStylistMessage();
  const dashboardStylistMessage = dashboardStylistQuery.data;

  return (
    <Paper sx={{ borderRadius: 8, p: 4, boxShadow: 2, height: "100%" }}>
      <Grid container height="100%" display="flex" gap={2}>
        <Grid size={5} sx={{ height: "100%" }}>
          <Stack gap={8}>
            <Typography fontFamily={"ui-serif"} fontStyle="italic" variant="h6">
              Your wardrobe at a glance:
            </Typography>

            <Typography >
              {dashboardStylistMessage?.message
                .split(/(?<=[.!?])\s+/)
                .map((sentence, index) => (
                  <Typography sx={{mb: 2}} key={index}>{sentence}</Typography>
                )) || dashboardStylistMessage?.message}
            </Typography>
          </Stack>
        </Grid>
        <Grid size={"grow"} sx={{ height: "100%" }}>
          <Stack gap={2}>
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
              <Typography variant="body1">Your color distribution</Typography>
              <PieChart
                series={[
                  {
                    data: clothingStats?.colorCounts
                      ? Object.entries(clothingStats.colorCounts).map(
                          ([color, count], index) => ({
                            id: index,
                            value: count,
                            label: color,
                            color: COLOR_MAP[color] || "#888888",
                          }),
                        )
                      : [],
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    highlightScope: { fade: "global", highlight: "item" },
                  },
                ]}
                width={200}
                height={200}
                hideLegend
                title="Color distribution"
              />
            </Box>

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
              <Typography variant="body1">Your clothing category distribution</Typography>
              <BarChart
                xAxis={[
                  {
                    data: clothingStats?.categoryCounts
                      ? Object.keys(clothingStats.categoryCounts)
                      : [],
                    scaleType: "band",
                  },
                ]}
                series={[
                  {
                    data: clothingStats?.categoryCounts
                      ? Object.values(clothingStats.categoryCounts)
                      : [],
                  },
                ]}
                height={300}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
