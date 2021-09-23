import {
	Box,
	Divider,
	Drawer,
	IconButton,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { UserContext } from "../data";
import { useContext } from "react";
import { useHistory } from "react-router-dom";

interface SidebarProps {
	mobileOpen: boolean;
	onClose: () => any;
	width: number;
}

export function Sidebar({ mobileOpen, onClose, width }: SidebarProps) {
	const [user, setUser] = useContext(UserContext);
	const history = useHistory();
	const theme = useTheme();
	const onMobile = !useMediaQuery(theme.breakpoints.up("md"));

	const drawerContent = (
		<Stack>
			<Stack direction="row" alignItems="center" p={2}>
				<Typography variant="h6">CL-Dash</Typography>
				{onMobile && (
					<Box sx={{ ml: "auto" }}>
						<IconButton onClick={onClose}>
							<CloseIcon />
						</IconButton>
					</Box>
				)}
			</Stack>
			<Divider />
		</Stack>
	);

	return (
		<>
			{onMobile ? (
				<Drawer
					variant="temporary"
					open={mobileOpen}
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
				</Drawer>
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
