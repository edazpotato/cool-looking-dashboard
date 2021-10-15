import {
	Button,
	Stack,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { ForwardedRef, forwardRef, useContext } from "react";
import { callAPI, useAPI } from "../../utils";

import { UserContext } from "../../data";

export const BoardsPage = forwardRef((_, ref: ForwardedRef<any>) => {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const {
		data: boards,
		setData: setBoards,
		loading,
		error,
		makeRequest,
	} = useAPI("boards", user.loggedIn ? user.token : undefined);

	return user.loggedIn ? (
		<Stack ref={ref}>
			<Toolbar>
				<Button
					sx={{ ml: "auto" }}
					variant="contained"
					color="secondary"
					onClick={() => makeRequest()}
				>
					Refresh boards list
				</Button>
				<Button sx={{ ml: 4 }} variant="contained" onClick={() => {}}>
					New board
				</Button>
			</Toolbar>
		</Stack>
	) : (
		<Typography ref={ref}>
			You{"'"}re trying to render the boards page, but you{"'"}re not
			logged in.
		</Typography>
	);
});
