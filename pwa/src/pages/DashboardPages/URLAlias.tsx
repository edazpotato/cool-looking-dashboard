import {
	Alert,
	AlertTitle,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemText,
	Skeleton,
	Stack,
	TextField,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useContext, useState } from "react";

import { UserContext } from "../../data";
import { useAPI } from "../../utils";

interface URLAlias {
	canonical_url: string;
	created: number;
	id: number;
	slug: string;
	uses: number;
	meta: {
		colour: string | null;
		title: string | null;
		description: string | null;
	};
}

export function URLAlias() {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const res = useAPI("url-aliases", user.loggedIn ? user.token : undefined);
	const { error, loading } = res;
	const data = res.data as URLAlias[];

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [currentAlias, setCurrentAlias] = useState<null | URLAlias>(null);

	return user.loggedIn ? (
		<Box sx={{ width: "100%" }}>
			<Dialog
				fullScreen={!onDesktop}
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				maxWidth="sm"
				fullWidth
				aria-labelledby="alias-url-edit-dialog-title"
			>
				<DialogTitle id="alias-url-edit-dialog-title">
					Editing {`/a/${currentAlias?.slug}`}
				</DialogTitle>
				<DialogContent>
					<Stack direction="row">
						<Typography variant="subtitle1">
							{currentAlias?.uses} hits so far.
						</Typography>
						<Button
							variant="contained"
							color="error"
							onClick={() => {}}
							sx={{ ml: "auto" }}
						>
							Delete
						</Button>
					</Stack>

					<Stack
						sx={{ mt: 6 }}
						direction="row"
						flexWrap="wrap"
						gap={2}
					>
						<TextField
							label="Slug"
							value={currentAlias?.slug || ""}
							onChange={(e) =>
								currentAlias &&
								setCurrentAlias({
									...currentAlias,
									slug: e.target.value,
								})
							}
						/>
						<TextField
							label="Cannoncial URL"
							value={currentAlias?.canonical_url || ""}
							onChange={(e) =>
								currentAlias &&
								setCurrentAlias({
									...currentAlias,
									canonical_url: e.target.value,
								})
							}
						/>
					</Stack>
					<Divider sx={{ mt: 4, mb: 4 }} />
					<Stack direction="row" flexWrap="wrap" gap={2}>
						<TextField
							label="Meta title"
							value={currentAlias?.meta.title || ""}
							onChange={(e) =>
								currentAlias &&
								setCurrentAlias({
									...currentAlias,
									meta: {
										...currentAlias.meta,
										title: e.target.value,
									},
								})
							}
						/>
						<TextField
							label="Meta description"
							value={currentAlias?.meta.description || ""}
							onChange={(e) =>
								currentAlias &&
								setCurrentAlias({
									...currentAlias,
									meta: {
										...currentAlias.meta,
										description: e.target.value,
									},
								})
							}
						/>
						<TextField
							type="color"
							sx={{ minWidth: "40%" }}
							label="Meta colour"
							value={currentAlias?.meta.colour || ""}
							onChange={(e) =>
								currentAlias &&
								setCurrentAlias({
									...currentAlias,
									meta: {
										...currentAlias.meta,
										colour: e.target.value,
									},
								})
							}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={() => setEditDialogOpen(false)}>
						Cancel
					</Button>
					<Button onClick={() => setEditDialogOpen(false)}>
						Save changes
					</Button>
				</DialogActions>
			</Dialog>
			<List>
				{loading ? (
					Object.keys(Array.from(Array(10))).map((key) => (
						<ListItem key={key}>
							<Stack>
								<Skeleton
									variant="text"
									height={20}
									width={200}
								/>
								<Skeleton
									variant="text"
									height={20}
									width={Math.max(
										300 * (Math.random() * 1.4),
										200
									)}
								/>
							</Stack>
						</ListItem>
					))
				) : error ? (
					<ListItem>
						<Alert severity="error">
							<AlertTitle>
								An error occurred while loading the aliases.
							</AlertTitle>
							{typeof error === "string" ? " " + error : null}
						</Alert>
					</ListItem>
				) : (
					data.map((item) => (
						<ListItem
							key={item.id}
							button
							onClick={() => {
								setCurrentAlias(item);
								setEditDialogOpen(true);
							}}
						>
							<ListItemText
								primary={`/a/${item.slug}`}
								secondary={`${item.uses} hit${
									item.uses === 1 ? "" : "s"
								} redirected to ${item.canonical_url}`}
							/>
						</ListItem>
					))
				)}
			</List>
		</Box>
	) : (
		<Typography>
			Something is very wrong. You aren{"'"}t logged in, but you{"'"}re
			trying to manage the URL aliases.
		</Typography>
	);
}
