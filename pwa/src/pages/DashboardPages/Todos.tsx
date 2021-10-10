import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Stack,
	TextField,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { callAPI, useAPI } from "../../utils";
import { useContext, useState } from "react";

import AddTaskIcon from "@mui/icons-material/AddTaskSharp";
import DoneIcon from "@mui/icons-material/DoneSharp";
import EditIcon from "@mui/icons-material/EditSharp";
import { UserContext } from "../../data";
import { useSnackbar } from "notistack";

interface TodoListItemType {
	id: number | string;
	is_completed: boolean;
	content: string;
	added: number;
	completed: number;
	updated: number;
}

interface TodoListType {
	id: number | string;
	title: string;
	created: number;
	updated: number;
	todos: TodoListItemType[];
}

export function Todos() {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const { data, setData, makeRequest, loading, error } = useAPI(
		"todos",
		user.loggedIn ? user.token : undefined
	);
	const [newTodoListDialogeOpen, setNewTodoListDialogeOpen] = useState(false);

	return user.loggedIn ? (
		<Stack>
			<Stack direction="row" sx={{ ml: "auto", mr: 2, mt: 2, gap: 2 }}>
				<Button
					color="secondary"
					variant="contained"
					onClick={() => makeRequest()}
				>
					Refresh data
				</Button>
				<Button
					variant="contained"
					onClick={() => setNewTodoListDialogeOpen(true)}
				>
					New todo list
				</Button>
			</Stack>
			{loading ? (
				<Typography>Loading...</Typography>
			) : error ? (
				<Typography>
					An error occurred while loading the todo lists: {error}
				</Typography>
			) : (
				data.data.map((todoList: TodoListType) => (
					<TodoList
						key={todoList.id}
						data={todoList}
						setFetchData={setData}
					/>
				))
			)}
			<NewTodolistDialog
				onDesktop={onDesktop}
				newTodoListDialogeOpen={newTodoListDialogeOpen}
				setNewTodoListDialogeOpen={setNewTodoListDialogeOpen}
				setData={setData}
				data={data}
			/>
		</Stack>
	) : (
		<Typography>
			Something is very wrong. You aren{"'"}t logged in, but you{"'"}re
			trying to look at the todo lists page.
		</Typography>
	);
}

interface TodoListProps {
	data: TodoListType;
	setFetchData: any;
}

function TodoList({ data, setFetchData }: TodoListProps) {
	const [user] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();
	const [editingTitle, setEditingTitle] = useState(false);
	const [tempTitle, setTempTitle] = useState(data.title);
	const [newTodoItemText, setNewTodoItemText] = useState("");

	return (
		<Paper sx={{ p: 4, m: 4 }}>
			<Stack>
				<Stack direction="row">
					{editingTitle ? (
						<TextField
							sx={{
								"& > .MuiOutlinedInput-root > .MuiInputBase-input":
									{
										p: 0,
										fontSize: "2rem",
									},
							}}
							value={tempTitle}
							onChange={(e) => setTempTitle(e.target.value)}
						/>
					) : (
						<Typography variant="h4">{data.title}</Typography>
					)}
					<IconButton
						sx={{ ml: 2 }}
						onClick={() => {
							if (!editingTitle) {
								setEditingTitle(true);
							} else {
								if (data.title === tempTitle) {
									setEditingTitle(false);
								} else {
									callAPI(
										`todos/${data.id}`,
										user.loggedIn ? user.token : undefined,
										{
											method: "PATCH",
											body: JSON.stringify({
												title: tempTitle,
											}),
										}
									)
										.catch(console.warn)
										.then(() => {
											setFetchData(
												(oldFetchData: any) => ({
													...oldFetchData,
													data: [
														{
															...data,
															title: tempTitle,
														},
														...oldFetchData.data.filter(
															(
																thing: TodoListType
															) =>
																thing.id !==
																data.id
														),
													],
												})
											);
											setEditingTitle(false);
										});
								}
							}
						}}
					>
						{editingTitle ? <DoneIcon /> : <EditIcon />}
					</IconButton>
				</Stack>

				<Stack direction="row">
					<TextField
						value={newTodoItemText}
						onChange={(e) => setNewTodoItemText(e.target.value)}
						sx={{ flex: "1" }}
						label="New todo item"
						variant="standard"
					/>
					<IconButton
						disabled={newTodoItemText.length < 1}
						size="large"
						edge="end"
						onClick={() => {
							callAPI(
								`todos/${data.id}`,
								user.loggedIn ? user.token : undefined,
								{
									method: "POST",
									body: JSON.stringify({
										completed: false,
										content: newTodoItemText,
									}),
								}
							)
								.then((res) => {
									console.log("e", res);
									setFetchData((oldFetchData: any) => {
										const d = {
											...oldFetchData,
											data: [
												{
													...data,
													todos: [
														{
															id: res.data.id,
															is_completed: false,
															completed: null,
															content:
																newTodoItemText,
															added: Date.now(),
															updated: Date.now(),
														},
														...data.todos.filter(
															(
																thing: TodoListItemType
															) =>
																thing.id !==
																res.data.id
														),
													],
												},
												...oldFetchData.data.filter(
													(thing: TodoListType) =>
														thing.id !== data.id
												),
											],
										};
										console.log(d);
										return d;
									});
									setNewTodoItemText("");
								})
								.catch(console.warn);
						}}
					>
						<AddTaskIcon sx={{ transform: "scale(1.3)" }} />
					</IconButton>
				</Stack>
				<List sx={{ maxHeight: 250, overflowY: "auto" }}>
					{data.todos.map((todo) => (
						<TodoListItem key={todo.id} data={todo} />
					))}
				</List>
			</Stack>
		</Paper>
	);
}

interface TodoListItemProps {
	data: TodoListItemType;
}

function TodoListItem({ data }: TodoListItemProps) {
	return (
		<ListItem sx={{ p: 0 }}>
			<ListItemButton>
				<ListItemText primary={data.content} />
			</ListItemButton>
		</ListItem>
	);
}

function NewTodolistDialog({
	onDesktop,
	newTodoListDialogeOpen,
	setNewTodoListDialogeOpen,
	setData,
	data,
}: {
	onDesktop: boolean;
	newTodoListDialogeOpen: boolean;
	setNewTodoListDialogeOpen: any;
	setData: any;
	data: any;
}) {
	const [user] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();
	const [name, setName] = useState("");

	return (
		<Dialog
			open={newTodoListDialogeOpen}
			onClose={() => setNewTodoListDialogeOpen(false)}
			fullScreen={!onDesktop}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>New todo list</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Enter a name for the new todo list.
				</DialogContentText>
				<TextField
					value={name}
					onChange={(e) => setName(e.target.value)}
					autoFocus
					variant="standard"
					margin="dense"
					id="new-todo-list-title-text-field"
					label="Todo list title"
					autoComplete="off"
					fullWidth
					required
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setNewTodoListDialogeOpen(false)}>
					Cancel
				</Button>
				<Button
					onClick={() => {
						callAPI(
							"todos",
							user.loggedIn ? user.token : undefined,
							{
								method: "POST",
								body: JSON.stringify({ title: name }),
							}
						)
							.then((resData) => {
								setNewTodoListDialogeOpen(false);
								setData({
									...data,
									data: [
										{
											id: resData.data.id,
											title: name,
											created: Date.now(),
											updated: Date.now(),
											todos: [],
										},
										...data.data,
									],
								});
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
