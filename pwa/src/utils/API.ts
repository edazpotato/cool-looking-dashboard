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

type DataType =
	| null
	| {
			errror?: string | true;
			detail?: string | { msg?: string };
	  }
	| { data: any; error?: false };

export function useAPI(
	endpoint: string,
	token?: string,
	fetchArgs?: any,
	showSnackbarOnError: boolean = true
) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<boolean | string>(false);
	const [data, setData] = useState<DataType>(null);
	const [user, setUser] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();

	useDebugValue(
		error
			? "Errored"
			: loading
			? "Loading data..."
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

	return {
		loading,
		error,
		data,
		makeRequest,
		setData,
	};
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
				return reject(err);
			})
			.then((res) => {
				if (res) {
					if (!res.ok) {
						if (res.status === 406) {
							if (useAPIOptions) {
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
						return reject(err);
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
								return reject(err);
							})
							.then((data: DataType) => {
								if (data !== undefined && data !== null) {
									if (
										"detail" in data &&
										typeof data.detail !== "undefined"
									) {
										const err =
											typeof data.detail === "string"
												? data.detail
												: "msg" in data.detail
												? data.detail.msg
												: "Unknown error";

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
										return reject(err);
									} else {
										if (useAPIOptions) {
											useAPIOptions.setData(data);
											useAPIOptions.setLoading(false);
										}
										return resolve(data);
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
									return reject(err);
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
					return reject(err);
				}
			});
	});

	return promise;
}
