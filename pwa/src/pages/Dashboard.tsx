import { Box, Button, Typography } from "@mui/material";

import { UserContext } from "../data";
import { useContext } from "react";

export function Dashboard() {
	const [user, setUser] = useContext(UserContext);
	return user.loggedIn ? (
		<Box>
			<Typography>{user.name}, you are logged in!</Typography>
			<Button
				onClick={() => setUser({ loggedIn: false })}
				variant="contained"
				color="secondary"
			>
				Log out
			</Button>
		</Box>
	) : (
		<Typography>
			Something is very broken. The dashboard is trying to render, but you
			aren't logged in.
		</Typography>
	);
}
