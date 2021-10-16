import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { ForwardedRef, forwardRef, useContext, useState } from "react";
import { callAPI, useAPI } from "../../utils";

import { UserContext } from "../../data";
import { useSnackbar } from "notistack";

interface BoardType {
	id: string | number;
	title: string;
	created: number;
	updated: number;
}

export const BoardsPage = forwardRef((_, ref: ForwardedRef<any>) => {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const wider = useMediaQuery(theme.breakpoints.up("xs"));
	const [activeBoardID, setActiveBoardID] = useState<string | number>("");
	const [newBoardDialogOpen, setNewBoardDialogOpen] = useState(false);

	const {
		data: boards,
		setData: setBoards,
		loading,
		error,
		makeRequest,
	} = useAPI("boards", user.loggedIn ? user.token : undefined);

	return user.loggedIn ? (
		<Stack ref={ref}>
			<NewBoardDialog
				open={newBoardDialogOpen}
				onClose={() => setNewBoardDialogOpen(false)}
				setData={setBoards}
			/>
			<Toolbar>
				{wider && (
					<FormControl sx={{ ml: "auto" }}>
						<InputLabel id="board-selector"></InputLabel>
						<Select
							variant="filled"
							sx={{
								minWidth: 150,
							}}
							disabled={loading || !!error}
							labelId="board-selector"
							label="Select board"
							value={activeBoardID}
							onChange={(e) => setActiveBoardID(e.target.value)}
							renderValue={(selected) => {
								if (!selected) {
									return (
										<em>
											{loading
												? "Loading..."
												: "Select a board"}
										</em>
									);
								}
								return (
									(boards &&
										"data" in boards &&
										(
											boards.data.find(
												(board: BoardType) =>
													board.id === selected
											) as BoardType | undefined
										)?.title) ||
									selected
								);
							}}
						>
							<MenuItem disabled value="">
								<em>Select a board</em>
							</MenuItem>
							{boards &&
								"data" in boards &&
								boards.data.map((board: BoardType) => (
									<MenuItem key={board.id} value={board.id}>
										{board.title}
									</MenuItem>
								))}
						</Select>
					</FormControl>
				)}
				<Button
					sx={{ ml: wider ? 4 : "auto" }}
					variant="contained"
					color="secondary"
					onClick={() => makeRequest()}
				>
					Refresh data
				</Button>
				<Button
					sx={{ ml: 4 }}
					variant="contained"
					onClick={() => setNewBoardDialogOpen(true)}
				>
					New board
				</Button>
			</Toolbar>
			{!wider && (
				<Alert severity="warning">
					You need to rotate your device to use the Kanaban boards
					feature
				</Alert>
			)}
		</Stack>
	) : (
		<Typography ref={ref}>
			You{"'"}re trying to render the boards page, but you{"'"}re not
			logged in.
		</Typography>
	);
});

function NewBoardDialog({
	open,
	onClose,
	setData,
}: {
	open: boolean;
	onClose: () => any;
	setData: any;
}) {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));
	const { enqueueSnackbar } = useSnackbar();
	const [title, setTitle] = useState("");

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullScreen={!onDesktop}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>New board</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Enter a title for the new board.
				</DialogContentText>
				<TextField
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					autoFocus
					variant="standard"
					margin="dense"
					id="new-board-title-text-field"
					label="Board title"
					autoComplete="off"
					fullWidth
					required
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={() => {
						callAPI(
							"boards",
							user.loggedIn ? user.token : undefined,
							{
								method: "POST",
								body: JSON.stringify({ title }),
							}
						)
							.then((res) => {
								if (!res) return;
								if (!("data" in res)) return;
								onClose();
								setData({
									...res,
									data: [
										{
											id: res.data.id,
											title,
											created: Date.now(),
											updated: Date.now(),
										},
										...res.data,
									],
								});
								setTitle("");
							})
							.catch(console.warn);
					}}
				>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
