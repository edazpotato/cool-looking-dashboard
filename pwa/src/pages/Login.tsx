import { Box, Button, Typography } from "@mui/material";

import { UserContext } from "../data";
import { useContext } from "react";

export function Login() {
	const [user, setUser] = useContext(UserContext);
	return !user.loggedIn ? (
		<Box>
			<Typography>Not logged in :{"("}</Typography>
			<Button
				onClick={() =>
					setUser({
						loggedIn: true,
						name: "Edaz",
						token: "ligma1000",
					})
				}
				variant="outlined"
			>
				Log in
			</Button>
		</Box>
	) : (
		<Typography>
			Something is very broken. The login page is trying to render, but
			you{"'"}re already logged in.
		</Typography>
	);
}
