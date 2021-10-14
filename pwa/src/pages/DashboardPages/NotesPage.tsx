import {
	Alert,
	AlertTitle,
	Button,
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
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const { data, setData, makeRequest, loading, error } = useAPI(
		"notes",
		user.loggedIn ? user.token : undefined
	);

	return user.loggedIn ? (
		<Stack sx={{ px: 4, pb: 4 }}>
			<Toolbar>
				<Button
					sx={{ ml: "auto" }}
					variant="contained"
					color="secondary"
					onClick={() => makeRequest()}
				>
					Refresh data
				</Button>
				<Button sx={{ ml: 2 }} variant="contained" onClick={() => {}}>
					New note
				</Button>
			</Toolbar>

			{/* {error ? (
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
				data !== null &&
				data.data.map((note: NoteType) => {
					console.log(note);
					return (
						<Note
							key={note.id}
							data={note}
							setFetchData={setData}
						/>
					);
				})()
			)} */}
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

function Note({ data }: NoteProps) {
	const [user] = useContext(UserContext);
	const [content, setContent] = useState(data.content);
	return (
		<Paper sx={{ p: 4 }}>
			{user.loggedIn ? (
				<Stack>
					<Stack direction="row" sx={{ alignItems: "center" }}>
						<Typography>{data.title.slice(0, 20)}</Typography>
						<Button
							sx={{ ml: "auto" }}
							disabled={content === data.content}
							onClick={() => {}}
						>
							Save changes
						</Button>
						<Button
							sx={{ ml: 2 }}
							variant="contained"
							color="error"
							onClick={() => {}}
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
