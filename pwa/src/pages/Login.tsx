import { Box, Button, Typography } from "@mui/material";

import { UserContext } from "../data";
import { callAPI } from "../utils";
import { useContext } from "react";

export function Login() {
	const [user, setUser] = useContext(UserContext);
	return !user.loggedIn ? (
		<Box>
			<Typography>Not logged in :{"("}</Typography>
			<Button
				onClick={() => {
					callAPI(
						"auth/please-give-me-a-token-pretty-please",
						undefined,
						{
							body: JSON.stringify({
								mode: "begging",
								data: { username: "edaz" },
							}),
						}
					)
						.catch(console.warn)
						.then((data) => {
							setTimeout(() => {
								setUser({ loggedIn: false });
							}, Math.floor(data["that_expires_at_this_unix_timestamp"] - Date.now()));
							setUser({
								loggedIn: true,
								name: data["username"],
								token: data["your_shiny_new_token"],
							});
						});
				}}
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
