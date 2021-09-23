import {
	Box,
	Button,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useContext, useState } from "react";

import { Sidebar } from "../components";
import { UserContext } from "../data";

const drawerWidth = 300;

export function Dashboard() {
	const [user, setUser] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	return user.loggedIn ? (
		<Box
			sx={{
				display: "flex",
				pl: onDesktop ? `${drawerWidth}px` : undefined,
			}}
		>
			<Sidebar
				mobileOpen={mobileSidebarOpen}
				onClose={() => setMobileSidebarOpen(false)}
				width={drawerWidth}
			/>
			<RouterSwitch>
				<Route path="/">
					<Typography>{user.name}, you are logged in! </Typography>
					{!onDesktop && (
						<Button
							onClick={() => setMobileSidebarOpen(true)}
							variant="contained"
							color="secondary"
						>
							Open sidebar
						</Button>
					)}
				</Route>
			</RouterSwitch>
		</Box>
	) : (
		<Typography>
			Something is very broken. The dashboard is trying to render, but you
			aren't logged in.
		</Typography>
	);
}
