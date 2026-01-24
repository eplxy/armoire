import { Stack, Typography } from "@mui/material";
import { useTestQuery } from "../hooks/queries/testQueries";

export default function IndexView() {
  const testQuery = useTestQuery();

  return (
    <div>
      Index View
      <Stack>
        <Typography variant="h4">Welcome to Armoire!</Typography>
        <Typography variant="body1">
          This is the index view of the Armoire application.
        </Typography>

        <Typography variant="body2">
          Testing API:{" "}
          {testQuery.isLoading ? "Loading..." : testQuery.data?.message}
          {testQuery.isError && "Error fetching data"}
        </Typography>
      </Stack>
    </div>
  );
}
