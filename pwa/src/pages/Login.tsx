import { Box, Button, Typography } from "@mui/material";
import { callAPI, logout } from "../utils";
import { useContext, useState } from "react";

import { UserContext } from "../data";

export function Login() {
	const [user, setUser] = useContext(UserContext);
	const [disabled, setDisabled] = useState(false);

	return !user.loggedIn ? (
		<Box>
			<Typography>Not logged in :{"("}</Typography>
			<Button
				disabled={disabled}
				onClick={() => {
					setDisabled(true);
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
						.then((res) => {
							if (!res) return;
							if (!("data" in res)) return;
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
									() => logout(user, setUser),
									new Date(
										data[
											"that_expires_at_this_unix_timestamp"
										] * 1000
									).getTime() - Date.now()
								),
							});
						})
						.catch((e) => {
							console.warn(e);
							setDisabled(false);
						});
				}}
				variant="outlined"
			>
				Ask nicely for a token
			</Button>
		</Box>
	) : (
		<Typography>
			Something is very broken. The login page is trying to render, but
			you{"'"}re already logged in.
		</Typography>
	);
}
