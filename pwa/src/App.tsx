import { Dashboard, Login } from "./pages";
import { Slide, ThemeProvider, createTheme } from "@mui/material";

import { HashRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { TransitionProps } from "@mui/material/transitions";
import { UserContext } from "./data";
import { useContext } from "react";

const primary = "#2e9e1b";
const secondary = "#5e1276";
const background = "#121212";
const text = "#ffffff";

const theme = createTheme({
	spacing: 4,
	shape: { borderRadius: 0 },
	palette: {
		mode: "dark",
		primary: {
			main: primary,
		},
		secondary: { main: secondary },
		background: {
			paper: background,
			default: background,
		},
	},
	components: {
		MuiTypography: { styleOverrides: { root: { color: text } } },
		MuiButtonBase: { styleOverrides: { root: { color: primary } } },
	},
});

window.theme = theme;
declare global {
	interface Window {
		theme: any;
	}
}

export function SlideTransition(props: TransitionProps) {
	// @ts-ignore
	return <Slide {...props} direction="left" />;
}

export default function App() {
	const [user] = useContext(UserContext);

	return (
		<ThemeProvider theme={theme}>
			<SnackbarProvider
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				TransitionComponent={SlideTransition}
				variant="error"
			>
				<Router>{user.loggedIn ? <Dashboard /> : <Login />}</Router>
			</SnackbarProvider>
		</ThemeProvider>
	);
}
