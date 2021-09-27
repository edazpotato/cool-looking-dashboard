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
								data: { username: "Edaz" },
							}),
							method: "POST",
						}
					)
						.catch(console.warn)
						.then((res) => {
							const data = res.data;
							setUser({
								loggedIn: true,
								name: data["username"],
								token: data["your_shiny_new_token"],
								tokenEpiresAt: Math.floor(
									data[
										"that_expires_at_this_unix_timestamp"
									] * 1000
								),
								autoLogOutTimeout: setTimeout(
									() => setUser({ loggedIn: false }),
									new Date(
										data[
											"that_expires_at_this_unix_timestamp"
										] * 1000
									).getTime() - Date.now()
								),
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
