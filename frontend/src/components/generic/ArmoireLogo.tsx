import { Typography, type SxProps } from "@mui/material";
import { useNavigate } from "react-router";

type LogoProps = {
  to?: string;
  sx?: SxProps;
};
export default function ArmoireLogo(props: LogoProps) {
  const navigate = useNavigate();
  return (
    <Typography
      variant="h4"
      align="center"
      fontFamily={"ui-serif"}
      sx={{ cursor: "pointer", ...props.sx }}
      onClick={() => navigate(props.to || "/landing")}
    >
      armoire
    </Typography>
  );
}
