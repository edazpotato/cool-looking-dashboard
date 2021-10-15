import {
	Box,
	Button,
	CSSObject,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	SvgIcon,
	SwipeableDrawer,
	Theme,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useContext, useState } from "react";

import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeftSharp";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRightSharp";
import BoardIcon from "@mui/icons-material/DashboardSharp";
import CloseIcon from "@mui/icons-material/CloseSharp";
import HomeIcon from "@mui/icons-material/HomeSharp";
import LinkIcon from "@mui/icons-material/LinkSharp";
import ListIcon from "@mui/icons-material/ListSharp";
import LogoutIcon from "@mui/icons-material/LogoutSharp";
import StickyNoteIcon from "@mui/icons-material/StickyNote2Sharp";
import { UserContext } from "../data";
import { logout } from "../utils";
import { useHistory } from "react-router-dom";

export const sidebarWidth = 300;
export const collapsedSidebarWidth = 73;

const pages: { text: string; slug: string; Icon: typeof SvgIcon }[] = [
	{
		text: "Home",
		slug: "/",
		Icon: HomeIcon,
	},
	{
		text: "Boards",
		slug: "/boards",
		Icon: BoardIcon,
	},
	{
		text: "Notes",
		slug: "/notes",
		Icon: StickyNoteIcon,
	},
	{
		text: "Todo lists",
		slug: "/todos",
		Icon: ListIcon,
	},
	{
		text: "URL Aliases",
		slug: "/url-alias",
		Icon: LinkIcon,
	},
];

interface SidebarProps {
	mobileOpen: boolean;
	onMobileClose: () => any;
	onMobileOpen: () => any;
	desktopExpanded: boolean;
	onDesktopCollapse: () => any;
	onDesktopExpand: () => any;
}

export function Sidebar({
	mobileOpen,
	onMobileClose,
	onMobileOpen,
	desktopExpanded,
	onDesktopCollapse,
	onDesktopExpand,
}: SidebarProps) {
	const [user, setUser] = useContext(UserContext);

	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const history = useHistory();
	const [selectedPage, setSelectedPage] = useState(history.location.pathname);

	history.listen(() => setSelectedPage(history.location.pathname));

	const iOS =
		typeof navigator !== "undefined" &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);

	const drawerContent = (
		<Stack
			sx={{
				flex: 1,
				mb: 4,
				alignItems:
					onDesktop && !desktopExpanded ? "center" : undefined,
			}}
		>
			<Stack sx={{ p: 2 }}>
				<Stack direction="row" alignItems="center">
					{(desktopExpanded || mobileOpen) && (
						<Typography variant="h6">CL-Dash</Typography>
					)}

					{onDesktop ? (
						<Box sx={{ ml: "auto" }}>
							<Tooltip
								title={
									desktopExpanded
										? "Collapse sidebar"
										: "Expand sidebar"
								}
							>
								<IconButton
									onClick={() => {
										if (desktopExpanded) {
											onDesktopCollapse();
										} else {
											onDesktopExpand();
										}
									}}
								>
									{desktopExpanded ? (
										<ArrowLeftIcon />
									) : (
										<ArrowRightIcon />
									)}
								</IconButton>
							</Tooltip>
						</Box>
					) : (
						<Box sx={{ ml: "auto" }}>
							<Tooltip title="Close sidebar">
								<IconButton onClick={onMobileClose}>
									<CloseIcon />
								</IconButton>
							</Tooltip>
						</Box>
					)}
				</Stack>
				{(desktopExpanded || mobileOpen) && (
					<Typography variant="caption">Version ???</Typography>
				)}
			</Stack>
			{onDesktop && !desktopExpanded ? (
				<>
					<Divider />
					<Tooltip title="Log out">
						<IconButton
							onClick={() => {
								logout(user, setUser, true);
							}}
						>
							<LogoutIcon />
						</IconButton>
					</Tooltip>
				</>
			) : (
				<Button
					sx={{ mb: 2 }}
					color="warning"
					onClick={() => {
						logout(user, setUser, true);
					}}
				>
					Log out
				</Button>
			)}
			<Divider />
			<List>
				{desktopExpanded || mobileOpen
					? pages.map((page) => (
							<ListItem
								button
								key={page.slug}
								onClick={() => {
									history.push(page.slug);
									!onDesktop && onMobileClose();
								}}
								selected={selectedPage === page.slug}
							>
								<ListItemIcon>
									<page.Icon />
								</ListItemIcon>
								<ListItemText primary={page.text} />
							</ListItem>
					  ))
					: pages.map((page) => (
							<ListItem
								sx={{
									"& > .MuiListItemIcon-root": {
										justifyContent: "center",
									},
								}}
								button
								key={page.slug}
								onClick={() => {
									history.push(page.slug);
									!onDesktop && onMobileClose();
								}}
								selected={selectedPage === page.slug}
							>
								<ListItemIcon>
									<page.Icon />
								</ListItemIcon>
							</ListItem>
					  ))}
			</List>
		</Stack>
	);

	return (
		<>
			{!onDesktop ? (
				<SwipeableDrawer
					disableBackdropTransition={!iOS}
					disableDiscovery={iOS}
					anchor="left"
					open={mobileOpen}
					onOpen={onMobileOpen}
					onClose={onMobileClose}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					sx={{
						display: "flex",
						flexDirection: "column",

						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: sidebarWidth,
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
						width: desktopExpanded
							? sidebarWidth
							: collapsedSidebarWidth,
						overflowX: "hidden",
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: desktopExpanded
								? sidebarWidth
								: collapsedSidebarWidth,
						},
					}}
					open={desktopExpanded}
				>
					{drawerContent}
				</Drawer>
			)}
		</>
	);
}
