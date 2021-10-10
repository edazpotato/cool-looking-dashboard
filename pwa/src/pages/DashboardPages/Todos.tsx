import {
	Alert,
	Button,
	Checkbox,
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
import DeleteIcon from "@mui/icons-material/DeleteSharp";
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
				<>
					{data.data.length < 1 && (
						<ListItem>
							<Alert severity="info">
								There aren{"'"}t any todo lists.
							</Alert>
						</ListItem>
					)}
					{data.data.map((todoList: TodoListType) => (
						<TodoList
							key={todoList.id}
							data={todoList}
							setFetchData={setData}
						/>
					))}
				</>
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
	const [editingTitle, setEditingTitle] = useState(false);
	const [tempTitle, setTempTitle] = useState(data.title);
	const [newTodoItemText, setNewTodoItemText] = useState("");

	return (
		<Paper sx={{ p: 4, m: 4, overflow: "auto" }}>
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
							autoComplete="off"
						/>
					) : (
						<Typography variant="h4">
							{data.title.slice(0, 5)}
						</Typography>
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
					<Button
						sx={{ ml: "auto" }}
						color="error"
						variant="contained"
						onClick={() => {
							callAPI(
								`todos/${data.id}`,
								user.loggedIn ? user.token : undefined,
								{ method: "DELETE" }
							)
								.then((res) => {
									setFetchData((oldFetchData: any) => ({
										...oldFetchData,
										data: oldFetchData.data.filter(
											(thing: TodoListType) =>
												thing.id !== data.id
										),
									}));
								})
								.catch(console.warn);
						}}
					>
						Delete
					</Button>
				</Stack>

				<Stack direction="row" sx={{ mt: 4 }}>
					<TextField
						value={newTodoItemText}
						onChange={(e) => setNewTodoItemText(e.target.value)}
						sx={{ flex: "1" }}
						label="New todo item"
						variant="standard"
						id={`new-todo-item-for-todo-list-${data.id}`}
						autoComplete="off"
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
										try {
											document
												.getElementById(
													`new-todo-item-for-todo-list-${data.id}`
												)
												?.focus();
										} catch {}
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
					{data.todos.length < 1 && (
						<ListItem>
							<Alert severity="info">
								There aren{"'"}t any items in this todo list.
							</Alert>
						</ListItem>
					)}
					{data.todos.map((todo) => (
						<TodoListItem
							key={todo.id}
							data={todo}
							setFetchData={setFetchData}
							todoListData={data}
						/>
					))}
				</List>
			</Stack>
		</Paper>
	);
}

interface TodoListItemProps {
	data: TodoListItemType;
	todoListData: TodoListType;
	setFetchData: any;
}

function TodoListItem({ data, setFetchData, todoListData }: TodoListItemProps) {
	const [user] = useContext(UserContext);

	return (
		<ListItem
			sx={{ p: 0 }}
			secondaryAction={
				<IconButton
					onClick={() => {
						callAPI(
							`todos/${todoListData.id}/${data.id}`,
							user.loggedIn ? user.token : undefined,
							{ method: "DELETE" }
						)
							.then((res) => {
								setFetchData((oldFetchData: any) => ({
									...oldFetchData,
									data: [
										{
											...todoListData,
											todos: todoListData.todos.filter(
												(thing: TodoListItemType) =>
													thing.id !== data.id
											),
										},
										...oldFetchData.data.filter(
											(thing: TodoListType) =>
												thing.id !== todoListData.id
										),
									],
								}));
							})
							.catch(console.warn);
					}}
					edge="end"
				>
					<DeleteIcon />
				</IconButton>
			}
		>
			<ListItemButton
				onClick={() => {
					callAPI(
						`todos/${todoListData.id}/${data.id}`,
						user.loggedIn ? user.token : undefined,
						{
							method: "PATCH",
							body: JSON.stringify({
								content: data.content,
								completed: !data.completed,
							}),
						}
					)
						.then((res) => {
							setFetchData((oldFetchData: any) => ({
								...oldFetchData,
								data: oldFetchData.data.map(
									(thing: TodoListType) => {
										if (thing.id !== todoListData.id)
											return thing;
										return {
											...todoListData,
											todos: todoListData.todos.map(
												(todo: TodoListItemType) => {
													if (todo.id !== data.id)
														return todo;
													return {
														...data,
														is_completed:
															!data.is_completed,
													};
												}
											),
										};
									}
								),
							}));
						})
						.catch(console.warn);
				}}
			>
				<ListItemIcon>
					<Checkbox
						edge="start"
						checked={data.is_completed}
						tabIndex={-1}
						disableRipple
						inputProps={{
							"aria-labelledby": `todolist-item-chckbox-label-${todoListData.id}-${data.id}`,
						}}
					/>
				</ListItemIcon>
				<ListItemText
					id={`todolist-item-chckbox-label-${todoListData.id}-${data.id}`}
					primary={data.content.slice(0, 20)}
				/>
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
								setName("");
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
