import {
	Box,
	Button,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	SwipeableDrawer,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useContext, useState } from "react";

import CloseIcon from "@mui/icons-material/CloseSharp";
import HomeIcon from "@mui/icons-material/HomeSharp";
import LinkIcon from "@mui/icons-material/LinkSharp";
import ListIcon from "@mui/icons-material/ListSharp";
import StickyNoteIcon from "@mui/icons-material/StickyNote2Sharp";
import { UserContext } from "../data";
import { logout } from "../utils";
import { useHistory } from "react-router-dom";

const pages: { text: string; slug: string; icon: JSX.Element }[] = [
	{
		text: "Home",
		slug: "/",
		icon: <HomeIcon />,
	},
	{
		text: "Notes",
		slug: "/notes",
		icon: <StickyNoteIcon />,
	},
	{
		text: "Todo lists",
		slug: "/todos",
		icon: <ListIcon />,
	},
	{
		text: "URL Aliases",
		slug: "/url-alias",
		icon: <LinkIcon />,
	},
];

interface SidebarProps {
	mobileOpen: boolean;
	onClose: () => any;
	onOpen: () => any;
	width: number;
}

export function Sidebar({ mobileOpen, onClose, width, onOpen }: SidebarProps) {
	const [user, setUser] = useContext(UserContext);
	const theme = useTheme();
	const onMobile = !useMediaQuery(theme.breakpoints.up("md"));

	const history = useHistory();
	const [selectedPage, setSelectedPage] = useState(history.location.pathname);

	history.listen(() => setSelectedPage(history.location.pathname));

	const iOS =
		typeof navigator !== "undefined" &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);

	const drawerContent = (
		<Stack sx={{ flex: 1, mb: 4 }}>
			<Stack sx={{ p: 2 }}>
				<Stack direction="row" alignItems="center">
					<Typography variant="h6">CL-Dash</Typography>
					{onMobile && (
						<Box sx={{ ml: "auto" }}>
							<Tooltip title="Close sidebar">
								<IconButton onClick={onClose}>
									<CloseIcon />
								</IconButton>
							</Tooltip>
						</Box>
					)}
				</Stack>
				<Typography variant="caption">Version ???</Typography>
			</Stack>
			<Button
				sx={{ mb: 2 }}
				color="warning"
				onClick={() => {
					logout(user, setUser, true);
				}}
			>
				Log out
			</Button>
			<Divider />
			<List>
				{pages.map((page) => (
					<ListItem
						button
						key={page.slug}
						onClick={() => {
							history.push(page.slug);
							onMobile && onClose();
						}}
						selected={selectedPage === page.slug}
					>
						<ListItemIcon>{page.icon}</ListItemIcon>
						<ListItemText primary={page.text} />
					</ListItem>
				))}
			</List>
		</Stack>
	);

	return (
		<>
			{onMobile ? (
				<SwipeableDrawer
					disableBackdropTransition={!iOS}
					disableDiscovery={iOS}
					anchor="left"
					open={mobileOpen}
					onOpen={onOpen}
					onClose={onClose}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					sx={{
						display: "flex",
						flexDirection: "column",

						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: width,
							borderRight: (theme) =>
								`1px solid ${theme.palette.divider}`,
							bgcolor: (theme) => theme.palette.background.paper,
							backgroundImage: "initial",
						},
					}}
				>
					{drawerContent}
				</SwipeableDrawer>
			) : (
				<Drawer
					variant="permanent"
					sx={{
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: width,
						},
					}}
					open
				>
					{drawerContent}
				</Drawer>
			)}
		</>
	);
}
