import { ThemeProvider } from "@emotion/react";
import "./App.css";
import Router from "./router/Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { armoireTheme } from "./hooks/armoireTheme";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 0,
      },
      mutations:{
        retry:0
      }
    },
  });

  const theme = armoireTheme;

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <ToastContainer position="top-center"/>
          <Router />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
