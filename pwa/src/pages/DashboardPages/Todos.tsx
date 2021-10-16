import {
	Alert,
	AlertTitle,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grow,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Stack,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { ForwardedRef, forwardRef, useContext, useState } from "react";
import { callAPI, useAPI } from "../../utils";

import AddTaskIcon from "@mui/icons-material/AddTaskSharp";
import DeleteIcon from "@mui/icons-material/DeleteSharp";
import DoneIcon from "@mui/icons-material/DoneSharp";
import EditIcon from "@mui/icons-material/EditSharp";
import { TransitionGroup } from "react-transition-group";
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

export const Todos = forwardRef((_, ref: ForwardedRef<any>) => {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const { data, setData, makeRequest, loading, error } = useAPI(
		"todos",
		user.loggedIn ? user.token : undefined
	);
	const [newTodoListDialogeOpen, setNewTodoListDialogeOpen] = useState(false);

	return user.loggedIn ? (
		<Stack ref={ref}>
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
					onClick={() => setNewTodoListDialogeOpen(true)}
				>
					New todo list
				</Button>
			</Toolbar>
			{error ? (
				<Alert severity="error">
					{typeof error === "string" ? (
						<>
							<AlertTitle>Error loading todo-lists</AlertTitle>
							{error}
						</>
					) : (
						<>Error loading todo-lists</>
					)}
				</Alert>
			) : loading ? (
				<Alert severity="info">Loading todo-lists...</Alert>
			) : (
				data &&
				"data" in data && (
					<TransitionGroup>
						{data.data.length < 1 && (
							<Grow>
								<ListItem>
									<Alert severity="info">
										There aren{"'"}t any todo lists.
									</Alert>
								</ListItem>
							</Grow>
						)}
						{data.data.map((todoList: TodoListType) => (
							<Grow key={todoList.id}>
								<TodoList
									data={todoList}
									setFetchData={setData}
								/>
							</Grow>
						))}
					</TransitionGroup>
				)
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
		<Typography ref={ref}>
			Something is very wrong. You aren{"'"}t logged in, but you{"'"}re
			trying to look at the todo lists page.
		</Typography>
	);
});

interface TodoListProps {
	data: TodoListType;
	setFetchData: any;
}

const TodoList = forwardRef(
	({ data, setFetchData }: TodoListProps, ref: ForwardedRef<any>) => {
		const [user] = useContext(UserContext);
		const [editingTitle, setEditingTitle] = useState(false);
		const [tempTitle, setTempTitle] = useState(data.title);
		const [newTodoItemText, setNewTodoItemText] = useState("");

		function onNewTodoAdd(e: any) {
			e?.preventDefault();

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
					if (!res) return;
					if (!("data" in res)) return;
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
										...data.todos,
										{
											id: res.data.id,
											is_completed: false,
											completed: null,
											content: newTodoItemText,
											added: Date.now(),
											updated: Date.now(),
										},
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
		}

		return (
			<Paper ref={ref} sx={{ p: 4, m: 4, overflow: "auto" }}>
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
											user.loggedIn
												? user.token
												: undefined,
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
															...oldFetchData.data.filter(
																(
																	thing: TodoListType
																) =>
																	thing.id !==
																	data.id
															),
															{
																...data,
																title: tempTitle,
															},
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
						<form
							action="#/todos"
							style={{ flex: 1 }}
							onSubmit={onNewTodoAdd}
						>
							<TextField
								value={newTodoItemText}
								onChange={(e) =>
									setNewTodoItemText(e.target.value)
								}
								fullWidth
								label="New todo item"
								variant="standard"
								id={`new-todo-item-for-todo-list-${data.id}`}
								autoComplete="off"
							/>
						</form>
						<IconButton
							disabled={newTodoItemText.length < 1}
							size="large"
							edge="end"
							onClick={onNewTodoAdd}
						>
							<AddTaskIcon sx={{ transform: "scale(1.3)" }} />
						</IconButton>
					</Stack>
					<List sx={{ maxHeight: 250, overflowY: "auto" }}>
						{data.todos.length < 1 && (
							<ListItem>
								<Alert severity="info">
									There aren{"'"}t any items in this todo
									list.
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
);

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
	const [title, setTitle] = useState("");

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
					Enter a title for the new todo list.
				</DialogContentText>
				<TextField
					value={title}
					onChange={(e) => setTitle(e.target.value)}
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
								body: JSON.stringify({ title }),
							}
						)
							.then((resData) => {
								if (!resData) return;
								if (!("data" in resData)) return;
								setNewTodoListDialogeOpen(false);
								setData({
									...data,
									data: [
										{
											id: resData.data.id,
											title,
											created: Date.now(),
											updated: Date.now(),
											todos: [],
										},
										...data.data,
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
