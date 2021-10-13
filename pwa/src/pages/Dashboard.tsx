import {
	Box,
	Button,
	IconButton,
	Stack,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { ErrorBoundary, Sidebar } from "../components";
import { HomePage, Todos, URLAlias } from "./DashboardPages";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useContext, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import { UserContext } from "../data";
import { useEffect } from "react";
import { useSnackbar } from "notistack";

const drawerWidth = 300;

export function Dashboard() {
	const [user] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	useEffect(() => {
		enqueueSnackbar("Logged in to CL-Dash.", { variant: "success" });
	}, [user, enqueueSnackbar]);

	window.enqueueSnackbar = enqueueSnackbar;

	return user.loggedIn ? (
		<Stack
			sx={{
				pl: onDesktop ? `${drawerWidth}px` : undefined,
			}}
		>
			<Sidebar
				mobileOpen={mobileSidebarOpen}
				onClose={() => setMobileSidebarOpen(false)}
				onOpen={() => setMobileSidebarOpen(true)}
				width={drawerWidth}
			/>
			{!onDesktop && (
				<Tooltip title="Open sidebar">
					<IconButton
						onClick={() => setMobileSidebarOpen(true)}
						sx={{
							position: "fixed",
							top: (theme) => theme.spacing(2),
							left: (theme) => theme.spacing(2),
							zIndex: (theme) => theme.zIndex.drawer - 1,
						}}
					>
						<MenuIcon />
					</IconButton>
				</Tooltip>
			)}
			<ErrorBoundary>
				<RouterSwitch>
					<Route path="/" exact>
						<HomePage />
					</Route>
					<Route path="/todos">
						<Todos />
					</Route>
					<Route path="/url-alias">
						<URLAlias />
					</Route>
					<Route path="/*">
						<Typography>
							Page not found lol.
							<br />
							Not a 404 though because this is client side.
						</Typography>
						<Box>
							{!onDesktop && (
								<Button
									onClick={() => setMobileSidebarOpen(true)}
									variant="contained"
									color="secondary"
								>
									Open sidebar
								</Button>
							)}
						</Box>
					</Route>
				</RouterSwitch>
			</ErrorBoundary>
		</Stack>
	) : (
		<Typography>
			Something is very broken. The dashboard is trying to render, but you
			aren{"'"}t logged in.
		</Typography>
	);
}

declare global {
	interface Window {
		enqueueSnackbar: any;
	}
}
