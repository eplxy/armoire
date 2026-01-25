import { Typography } from "@mui/material";
import { useNavigate } from "react-router";

type LogoProps = {
  to?: string;
};
export default function ArmoireLogo(props: LogoProps) {
  const navigate = useNavigate();
  return (
    <Typography
      variant="h4"
      align="center"
      fontFamily={"ui-serif"}
      sx={{ cursor: "pointer" }}
      onClick={() => navigate(props.to || "/landing")}
    >
      armoire
    </Typography>
  );
}
