import {
	useCallback,
	useContext,
	useDebugValue,
	useEffect,
	useState,
} from "react";

import { UserContext } from "../data";
import { logout } from "../utils";
import { useSnackbar } from "notistack";

export function useAPI(
	endpoint: string,
	token?: string,
	fetchArgs?: any,
	showSnackbarOnError: boolean = true
) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<boolean | string>(false);
	const [data, setData] = useState<any>(null);
	const [user, setUser] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();

	useDebugValue(
		loading
			? "Loading data..."
			: error
			? "Errored"
			: "Successfully loaded data!"
	);

	const makeRequest = useCallback(() => {
		setLoading(true);
		setError(false);
		callAPI(endpoint, token, fetchArgs, {
			showSnackbarOnError,
			enqueueSnackbar,
			setError,
			setLoading,
			setData,
			user,
			setUser,
		});
		/*
		fetch(`/api/${endpoint}`, {
			...fetchArgs,
			headers: {
				"X-Clearance": token
					? `Absolute lad. Proof: ${token}.`
					: "Nerd. No doumentation found. Reccomended treatment: Instant termination.",
				"Content-Type": "application/json",
				...fetchArgs?.headers,
			},
		})
			.catch((err) => {
				showSnackbarOnError &&
					enqueueSnackbar(err, { variant: "error" });
				setError(err);
				setLoading(false);
			})
			.then((res) => {
				if (res) {
					if (!res.ok) {
						if (res.status === 406) {
							logout(user, setUser);
						}
						const err = "Request not OK :(";
						setError(err);
						showSnackbarOnError &&
							enqueueSnackbar(err, { variant: "error" });
					} else {
						return res.json();
					}
				} else {
					const err = "Invalid response received :(";
					showSnackbarOnError &&
						enqueueSnackbar(err, { variant: "error" });
					setError(err);
					setLoading(false);
				}
			})
			.catch((err) => {
				showSnackbarOnError &&
					enqueueSnackbar(err, { variant: "error" });
				setError(err);
				setLoading(false);
			})
			.then((data) => {
				if (data) {
					if (data.error || data.detail) {
						const err = data.detail
							? data.detail.msg
								? data.detail.msg
								: data.detail
							: "Unknown error.";
						showSnackbarOnError &&
							enqueueSnackbar(err, { variant: "error" });
						setError(err);
						setLoading(false);
					} else {
						setData(data);
						setLoading(false);
					}
				} else {
					const err = "Invalid response body received.";
					showSnackbarOnError &&
						enqueueSnackbar(err, { variant: "error" });
					setError(err);
					setLoading(false);
				}
			});
			*/
	}, [
		endpoint,
		fetchArgs,
		token,
		user,
		setUser,
		enqueueSnackbar,
		showSnackbarOnError,
	]);

	useEffect(() => {
		makeRequest();
	}, [endpoint, token, fetchArgs, makeRequest]);

	return { loading, error, data, makeRequest, setData };
}

export async function callAPI(
	endpoint: string,
	token?: string,
	fetchArgs?: any,
	useAPIOptions?: any
) {
	const promise = new Promise<any>((resolve, reject) => {
		fetch(`/api/${endpoint}`, {
			...fetchArgs,
			headers: {
				"X-Clearance": token
					? `Gigachad. Proof: ${token}.`
					: "Nerd. No doumentation found. Reccomended treatment: Instant termination.",
				"Content-Type": "application/json",
				...fetchArgs?.headers,
			},
		})
			.catch((err) => {
				if (useAPIOptions) {
					useAPIOptions.showSnackbarOnError &&
						useAPIOptions.enqueueSnackbar(err);
					useAPIOptions.setError(err);
					useAPIOptions.setLoading(false);
				}
				try {
					window.enqueueSnackbar(err);
				} catch {}
				reject(err);
			})
			.then((res) => {
				if (res) {
					if (!res.ok) {
						if (res.status === 406) {
							if (useAPIOptions) {
								console.log(useAPIOptions);
								logout(
									useAPIOptions.user,
									useAPIOptions.setUser
								);
							} else {
								try {
									window.setUser({ loggedIn: false });
								} catch {}
							}
							try {
								window.enqueueSnackbar("No clearance!");
							} catch {}
						}
						const err = "Request not OK :(";
						if (useAPIOptions) {
							useAPIOptions.setError(err);
							useAPIOptions.showSnackbarOnError &&
								useAPIOptions.enqueueSnackbar(err);
						}
						try {
							window.enqueueSnackbar(err);
						} catch {}
						reject(err);
					} else {
						res.json()
							.catch((err) => {
								if (useAPIOptions) {
									useAPIOptions.showSnackbarOnError &&
										useAPIOptions.enqueueSnackbar(err);
									useAPIOptions.setError(err);
									useAPIOptions.setLoading(false);
								}
								try {
									window.enqueueSnackbar(err);
								} catch {}
								reject(err);
							})
							.then((data) => {
								if (
									(typeof data !== "undefined" ||
										typeof data !== "undefined") &&
									data
								) {
									if (data.error || data.detail) {
										const err = data.detail
											? data.detail.msg
												? data.detail.msg
												: typeof data.detail ===
												  "string"
												? data.detal
												: "An error happened lol"
											: "Unknown error.";
										if (useAPIOptions) {
											useAPIOptions.showSnackbarOnError &&
												useAPIOptions.enqueueSnackbar(
													err
												);
											useAPIOptions.setError(err);
											useAPIOptions.setLoading(false);
										}
										try {
											window.enqueueSnackbar(err);
										} catch {}
										reject(err);
									} else {
										if (useAPIOptions) {
											useAPIOptions.setData(data);
											useAPIOptions.setLoading(false);
										}
										resolve(data);
									}
								} else {
									const err =
										"Invalid response body received.";
									if (useAPIOptions) {
										useAPIOptions.showSnackbarOnError &&
											useAPIOptions.enqueueSnackbar(err);
										useAPIOptions.setError(err);
										useAPIOptions.setLoading(false);
									}
									try {
										window.enqueueSnackbar(err);
									} catch {}
									reject(err);
								}
							});
					}
				} else {
					const err = "Invalid response received :(";
					if (useAPIOptions) {
						useAPIOptions.showSnackbarOnError &&
							useAPIOptions.enqueueSnackbar(err);
						useAPIOptions.setError(err);
						useAPIOptions.setLoading(false);
					}
					try {
						window.enqueueSnackbar(err);
					} catch {}
					reject(err);
				}
			});
	});

	return promise;
}
