import {
	Alert,
	AlertTitle,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Link,
	List,
	ListItem,
	ListItemText,
	Skeleton,
	Stack,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { ForwardedRef, forwardRef, useContext, useRef, useState } from "react";
import { callAPI, useAPI } from "../../utils";

import { UserContext } from "../../data";

interface URLAliasType {
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

export const URLAlias = forwardRef((_, ref: ForwardedRef<any>) => {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const apiCall = useAPI(
		"url-aliases",
		user.loggedIn ? user.token : undefined
	);
	const { error, loading, makeRequest, data } = apiCall;
	const aliasData =
		data && "data" in data && Array.isArray(data.data)
			? (data.data as URLAliasType[])
			: undefined;

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [currentAlias, setCurrentAlias] = useState<null | URLAliasType>(null);
	const [newAliasDialogOpen, setNewAliasDialogOpen] = useState(false);
	const formRef = useRef<any>(null);

	return user.loggedIn ? (
		<Stack ref={ref} sx={{ width: "100%" }}>
			<Toolbar>
				<Button
					sx={{ ml: "auto" }}
					color="secondary"
					variant="contained"
					onClick={() => makeRequest()}
				>
					Refresh data
				</Button>
				<Button
					sx={{ ml: 4 }}
					variant="contained"
					onClick={() => setNewAliasDialogOpen(true)}
				>
					New Alias
				</Button>
			</Toolbar>
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
				) : aliasData ? (
					<>
						{aliasData.length < 1 && (
							<ListItem>
								<Alert severity="info">
									There aren{"'"}t any URL Aliases.
								</Alert>
							</ListItem>
						)}
						{aliasData.map((item) => (
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
						))}
					</>
				) : (
					<Typography>
						data.data is undefiend for some reason
					</Typography>
				)}
			</List>
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
						<Stack>
							<Typography>ID: {currentAlias?.id}</Typography>
							<Typography>Hits: {currentAlias?.uses}</Typography>
							<Typography>
								Created:{" "}
								{new Date(
									Math.floor(
										(currentAlias?.created || 0) * 1000
									)
								).toLocaleString()}
							</Typography>
						</Stack>
						<Stack sx={{ ml: "auto" }}>
							<Link
								sx={{ flex: 0, mb: 2 }}
								target="_blank"
								rel="noopener noreferrer"
								href={
									currentAlias?.canonical_url
										? currentAlias?.canonical_url
										: undefined
								}
							>
								View cannonical URL
							</Link>
							<Button
								sx={{ flex: 0 }}
								variant="contained"
								color="error"
								onClick={() => {
									if (currentAlias) {
										callAPI(
											`url-aliases/${currentAlias.slug}`,
											user.token,
											{
												method: "DELETE",
											}
										)
											.catch(console.warn)
											.then(() => {
												setEditDialogOpen(false);
												setCurrentAlias(null);
												makeRequest();
											});
									}
								}}
							>
								Delete
							</Button>
						</Stack>
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
							sx={{ minWidth: "223px" }}
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
					<Button
						// disabled
						onClick={() => {
							if (currentAlias) {
								callAPI(
									`url-aliases/${currentAlias.id}`,
									user.token,
									{
										method: "PATCH",
										body: JSON.stringify({
											slug: currentAlias.slug,
											canonical_url:
												currentAlias.canonical_url,
											meta_title: currentAlias.meta.title,
											meta_description:
												currentAlias.meta.description,
											meta_colour:
												currentAlias.meta.colour,
										}),
									}
								)
									.catch(console.warn)
									.then(() => {
										setEditDialogOpen(false);
										setCurrentAlias(null);
										makeRequest();
									});
							}
						}}
					>
						Save changes
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				fullScreen={!onDesktop}
				open={newAliasDialogOpen}
				onClose={() => setNewAliasDialogOpen(false)}
				maxWidth="sm"
				fullWidth
				aria-labelledby="new-alias-url-dialog-title"
			>
				<DialogTitle id="new-alias-url-dialog-title">
					Create a new URL alias
				</DialogTitle>
				<form ref={formRef}>
					<DialogContent>
						<Stack
							sx={{ mt: 2 }}
							direction="row"
							flexWrap="wrap"
							gap={2}
						>
							<TextField label="Slug" required name="slug" />
							<TextField
								type="url"
								label="Cannoncial URL"
								required
								name="canonical_url"
							/>
						</Stack>
						<Stack
							direction="row"
							flexWrap="wrap"
							gap={2}
							sx={{ mt: 2 }}
						>
							<TextField label="Meta title" name="meta_title" />
							<TextField
								label="Meta description"
								name="meta_description"
							/>
							<TextField
								type="color"
								sx={{ minWidth: "223px" }}
								label="Meta colour"
								name="meta_colour"
							/>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button
							autoFocus
							onClick={() => setNewAliasDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							// role="submit"
							onClick={(e) => {
								const form = formRef.current;
								console.log(form);
								form &&
									callAPI("url-aliases", user.token, {
										method: "POST",
										body: JSON.stringify({
											slug: form["slug"].value,
											canonical_url:
												form["canonical_url"].value,
											meta_title: form["meta_title"].value
												? form["meta_title"].value
												: null,
											meta_description: form[
												"meta_description"
											].value
												? form["meta_description"].value
												: null,
											meta_colour: form["meta_colour"]
												.value
												? form["meta_colour"].value
												: null,
										}),
									})
										.catch(console.warn)
										.then(() => {
											setNewAliasDialogOpen(false);
											makeRequest();
										});
							}}
						>
							Create
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Stack>
	) : (
		<Typography ref={ref}>
			Something is very wrong. You aren{"'"}t logged in, but you{"'"}re
			trying to manage the URL aliases.
		</Typography>
	);
});
