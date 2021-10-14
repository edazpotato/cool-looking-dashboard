import {
	Alert,
	AlertTitle,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Paper,
	Stack,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { callAPI, useAPI } from "../../utils";
import { useContext, useState } from "react";

import { UserContext } from "../../data";
import { useSnackbar } from "notistack";

interface NoteType {
	id: number | string;
	title: string;
	content: string;
	created: number;
	updated: number;
}

export function NotesPage() {
	const [user] = useContext(UserContext);
	const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);

	const { data, setData, makeRequest, loading, error } = useAPI(
		"notes",
		user.loggedIn ? user.token : undefined
	);

	return user.loggedIn ? (
		<Stack sx={{ px: 4, pb: 4 }}>
			<NewNoteDialog
				open={newNoteDialogOpen}
				setOpen={setNewNoteDialogOpen}
				setFetchData={setData}
			/>
			<Toolbar>
				<Button
					sx={{ ml: "auto" }}
					variant="contained"
					color="secondary"
					onClick={() => makeRequest()}
				>
					Refresh data
				</Button>
				<Button
					sx={{ ml: 2 }}
					variant="contained"
					onClick={() => setNewNoteDialogOpen(true)}
				>
					New note
				</Button>
			</Toolbar>

			{error ? (
				<Alert severity="error">
					{typeof error === "string" ? (
						<>
							<AlertTitle>Error loading notes</AlertTitle>
							{error}
						</>
					) : (
						<>Error loading notes</>
					)}
				</Alert>
			) : loading ? (
				<Alert severity="info">Loading notes...</Alert>
			) : (
				data &&
				"data" in data &&
				Array.isArray(data.data) &&
				(data.data.length < 1 ? (
					<Alert severity="info">No notes.</Alert>
				) : (
					data.data.map((note: NoteType) => (
						<Note
							key={note.id}
							data={note}
							setFetchData={setData}
						/>
					))
				))
			)}
		</Stack>
	) : (
		<Typography>
			You{"'"}re trying to render the notes page, but you{"'"}re not
			logged in.
		</Typography>
	);
}

interface NoteProps {
	data: NoteType;
	setFetchData: any;
}

function Note({ data, setFetchData }: NoteProps) {
	const [user] = useContext(UserContext);
	const [content, setContent] = useState(data.content);
	return (
		<Paper sx={{ p: 4, mb: 4 }}>
			{user.loggedIn ? (
				<Stack>
					<Stack direction="row" sx={{ alignItems: "center" }}>
						<Typography>{data.title.slice(0, 20)}</Typography>
						<Button
							sx={{ ml: "auto" }}
							variant="contained"
							color="error"
							onClick={() => {
								callAPI(
									`notes/${data.id}`,
									user.loggedIn ? user.token : undefined,
									{ method: "DELETE" }
								)
									.then((res) => {
										setFetchData(
											(oldFetchData: {
												data: NoteType[];
												[x: string]: any;
											}) => ({
												...oldFetchData,
												data: oldFetchData.data.filter(
													(thing) =>
														thing.id !== data.id
												),
											})
										);
									})
									.catch(console.warn);
							}}
						>
							Delete note
						</Button>
					</Stack>
					<TextField
						label="▼ ▼ ▼ Note goes down here ▼ ▼ ▼"
						sx={{
							mt: 2,
						}}
						rows={10}
						multiline
						fullWidth
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					<Button
						sx={{ mt: 4, alignSelf: "flex-start" }}
						disabled={content === data.content}
						onClick={() => {
							callAPI(
								`notes/${data.id}`,
								user.loggedIn ? user.token : undefined,
								{
									method: "PATCH",
									body: JSON.stringify({
										title: data.title,
										content,
									}),
								}
							)
								.then((res) => {
									setFetchData(
										(oldFetchData: {
											data: NoteType[];
											[x: string]: any;
										}) => ({
											...oldFetchData,
											data: oldFetchData.data.map(
												(thing) => {
													if (thing.id !== data.id)
														return thing;
													return {
														...thing,
														title: data.title,
														content,
													};
												}
											),
										})
									);
								})
								.catch(console.warn);
						}}
					>
						Save changes
					</Button>
				</Stack>
			) : (
				<Typography>
					You{"'"}re trying to render a note, but you{"'"}re not
					logged in.
				</Typography>
			)}
		</Paper>
	);
}

function NewNoteDialog({
	open,
	setOpen,
	setFetchData,
}: {
	open: boolean;
	setOpen: any;
	setFetchData: any;
}) {
	const [user] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();
	const [title, setTitle] = useState("");
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
			fullScreen={!onDesktop}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>New note</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Enter a title for the new note.
				</DialogContentText>
				<TextField
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					autoFocus
					variant="standard"
					margin="dense"
					id="new-todo-list-title-text-field"
					label="Note title goes here"
					autoComplete="off"
					fullWidth
					required
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setOpen(false)}>Cancel</Button>
				<Button
					onClick={() => {
						callAPI(
							"notes",
							user.loggedIn ? user.token : undefined,
							{
								method: "POST",
								body: JSON.stringify({
									title,
									content: "",
								}),
							}
						)
							.then((resData) => {
								setOpen(false);
								setFetchData(
									(oldFetchData: {
										data: NoteType[];
										[x: string]: any;
									}) => ({
										...oldFetchData,
										data: [
											{
												id: resData.data.id,
												title,
												created: Date.now(),
												updated: Date.now(),
												content: "",
											},
											...oldFetchData.data,
										],
									})
								);
								setTitle("");
							})
							.catch((err) => {
								enqueueSnackbar(err);
								console.warn(err);
							});
					}}
				>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
