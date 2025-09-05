import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { NotificationProvider } from "@/components/NotificationProvider";

const netflixTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#141414",
      paper: "#1e1e1e",
    },
    primary: {
      main: "#e50914",
    },
    text: {
      primary: "#f5f5f1",
      secondary: "#aaaaaa",
    },
  },
  typography: {
    fontFamily: "Helvetica Neue, Arial, sans-serif",
  },
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={netflixTheme}>
      <CssBaseline />
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </ThemeProvider>
  );
}
