import { SetUserFunction, UserData } from "../data";

import { callAPI } from ".";

export function logout(
	user: UserData,
	setUser: SetUserFunction,
	voluntary?: boolean
) {
	if (user.loggedIn) {
		const apiCall = callAPI("auth/please-revoke-my-clearance", user.token, {
			method: "DELETE",
		})
			.catch(console.warn)
			.then(() => console.info("Revoked token"));
		clearTimeout(user.autoLogOutTimeout);
		setUser({ loggedIn: false });

		try {
			window.enqueueSnackbar("Logged out of cl-dash.", {
				variant: voluntary ? "success" : "warning",
			});
		} catch {}

		return apiCall;
	}
}
