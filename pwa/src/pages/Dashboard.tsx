import {
	BoardsPage,
	HomePage,
	NotesPage,
	Todos,
	URLAlias,
} from "./DashboardPages";
import {
	ErrorBoundary,
	Sidebar,
	collapsedSidebarWidth,
	sidebarWidth,
} from "../components";
import {
	IconButton,
	Stack,
	SvgIcon,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useContext, useState } from "react";

import BoardIcon from "@mui/icons-material/DashboardSharp";
import HomeIcon from "@mui/icons-material/HomeSharp";
import LinkIcon from "@mui/icons-material/LinkSharp";
import ListIcon from "@mui/icons-material/ListSharp";
import MenuIcon from "@mui/icons-material/Menu";
import StickyNoteIcon from "@mui/icons-material/StickyNote2Sharp";
import { UserContext } from "../data";
import createPersistedState from "use-persisted-state";
import { useEffect } from "react";
import { useSnackbar } from "notistack";

const useDesktopExpanded = createPersistedState("desktop-sidebar-expanded");

export const pages: {
	text: string;
	slug: string;
	Icon: typeof SvgIcon;
	Component: JSX.Element;
}[] = [
	{
		text: "Home",
		slug: "/",
		Icon: HomeIcon,
		Component: <HomePage />,
	},
	{
		text: "Boards",
		slug: "/boards",
		Icon: BoardIcon,
		Component: <BoardsPage />,
	},
	{
		text: "Notes",
		slug: "/notes",
		Icon: StickyNoteIcon,
		Component: <NotesPage />,
	},
	{
		text: "Todo lists",
		slug: "/todos",
		Icon: ListIcon,
		Component: <Todos />,
	},
	{
		text: "URL Aliases",
		slug: "/url-alias",
		Icon: LinkIcon,
		Component: <URLAlias />,
	},
];

export function Dashboard() {
	const [user] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [desktopExpanded, setDesktopExpanded] = useDesktopExpanded(true);
	// const location = useLocation();

	useEffect(() => {
		enqueueSnackbar("Logged in to CL-Dash.", { variant: "success" });
	}, [user, enqueueSnackbar]);

	window.enqueueSnackbar = enqueueSnackbar;

	return user.loggedIn ? (
		<Stack
			sx={{
				pl: onDesktop
					? desktopExpanded
						? `${sidebarWidth}px`
						: `${collapsedSidebarWidth}px`
					: undefined,
			}}
		>
			<Sidebar
				mobileOpen={mobileSidebarOpen}
				onMobileClose={() => setMobileSidebarOpen(false)}
				onMobileOpen={() => setMobileSidebarOpen(true)}
				desktopExpanded={desktopExpanded}
				onDesktopCollapse={() => setDesktopExpanded(false)}
				onDesktopExpand={() => setDesktopExpanded(true)}
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
					{pages.map((page) => (
						<Route
							path={page.slug}
							exact={page.slug === "/"}
							key={page.slug}
						>
							{page.Component}
						</Route>
					))}
					<Route path="/*">
						<Typography>
							Page not found lol.
							<br />
							Not a 404 though because this is client side.
						</Typography>
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
