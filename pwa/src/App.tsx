import { Box, Button, Typography } from "@mui/material";
import {
	Route,
	HashRouter as Router,
	Switch as RouterSwitch,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { useState } from "react";

const primary = "#2e9e1b";
const secondary = "#5e1276";
const background = "#121212";

const theme = createTheme({
	shape: { borderRadius: 99999 },
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
	const [loggedIn, setLoggedIn] = useState(false);

	return (
		<>
			<ThemeProvider theme={theme}>
				<Router>
					<RouterSwitch>
						<Route path="/*">
							{loggedIn ? (
								<Box>
									<Typography>Logged in!</Typography>
									<Button
										onClick={() => setLoggedIn(false)}
										variant="outlined"
										color="secondary"
									>
										Log out
									</Button>
								</Box>
							) : (
								<Box>
									<Typography>
										Not logged in :{"("}
									</Typography>
									<Button
										onClick={() => setLoggedIn(true)}
										variant="outlined"
									>
										Log in
									</Button>
								</Box>
							)}
						</Route>
					</RouterSwitch>
				</Router>
			</ThemeProvider>
		</>
	);
}

export default App;
