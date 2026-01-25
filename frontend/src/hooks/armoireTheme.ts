import { createTheme } from "@mui/material";

export const armoireTheme = createTheme({
  palette: {
    background: {
      default: "#CFC6C2",
      paper: "#F2F0EF",
    },
    text: { primary: "#0D0D0D", secondary: "#4D4D4D" },
    primary: { main: "#9CA58E", contrastText: "#F2F0EF", light: "#cbd4c7" },
    secondary: { main: "#C5A3DB" },
    error: { main: "#DF4A4A", light: "#F4BEBE" },
    success: { main: "#9FB281" },
  },
  components: {
    // Name of the component
    MuiCssBaseline: {
      styleOverrides: `
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
                transition: background-color 5000s ease-in-out 0s;
            }
        `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});
