import { Dashboard, Login } from "./pages";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { HashRouter as Router } from "react-router-dom";
import { UserContext } from "./data";
import { useContext } from "react";

const primary = "#2e9e1b";
const secondary = "#5e1276";
const background = "#121212";

const theme = createTheme({
	spacing: 4,
	shape: { borderRadius: 8 },
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
		MuiTypography: { styleOverrides: { root: { color: "#ffffff" } } },
	},
});

declare module "@mui/material/Button" {
	interface ButtonPropsVariantOverrides {
		dotted: true;
	}
}

function App() {
	const [user] = useContext(UserContext);

	return (
		<ThemeProvider theme={theme}>
			<Router>{user.loggedIn ? <Dashboard /> : <Login />}</Router>
		</ThemeProvider>
	);
}

export default App;
