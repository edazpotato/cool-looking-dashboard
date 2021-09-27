import { SetUserFunction, UserData } from "../data";

import { callAPI } from ".";

export function logout(user: UserData, setUser: SetUserFunction) {
	if (user.loggedIn) {
		const apiCall = callAPI("auth/please-revoke-my-clearance", user.token, {
			method: "DELETE",
		})
			.catch(console.warn)
			.then(() => console.info("Revoked token"));
		clearTimeout(user.autoLogOutTimeout);
		setUser({ loggedIn: false });
		return apiCall;
	}
}
