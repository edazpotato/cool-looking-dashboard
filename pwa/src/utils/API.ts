import {
	useCallback,
	useContext,
	useDebugValue,
	useEffect,
	useState,
} from "react";

import { UserContext } from "../data";
import { logout } from "../utils";

export function useAPI(endpoint: string, token?: string, fetchArgs?: any) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<boolean | string>(false);
	const [data, setData] = useState<any>(null);
	const [user, setUser] = useContext(UserContext);

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
				setError(err);
				setLoading(false);
			})
			.then((res) => {
				if (res) {
					if (!res.ok) {
						if (res.status === 406) {
							logout(user, setUser);
						}
						setError("Request not OK :(");
					} else {
						return res.json();
					}
				} else {
					setError("Invalid responce received :(");
					setLoading(false);
				}
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			})
			.then((data) => {
				if (data) {
					if (data.error || data.detail) {
						setError(
							data.detail
								? data.detail.msg
									? data.detail.msg
									: data.detail
								: "Unknown error."
						);
						setLoading(false);
					} else {
						setData(data);
						setLoading(false);
					}
				} else {
					setError("Invalid response body received.");
					setLoading(false);
				}
			});
	}, [endpoint, fetchArgs, token, user, setUser]);

	useEffect(() => {
		makeRequest();
	}, [endpoint, token, fetchArgs, makeRequest]);

	return { loading, error, data, makeRequest, setData };
}

export async function callAPI(
	endpoint: string,
	token?: string,
	fetchArgs?: any
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
				reject(err);
			})
			.then((res) => {
				if (res) {
					if (!res.ok) {
						reject("Request not OK :(");
					} else {
						return res.json();
					}
				} else {
					reject("Invalid responce received :(");
				}
			})
			.catch((err) => {
				reject(err);
			})
			.then((data) => {
				if (data) {
					if (data.error || data.detail) {
						reject(
							data.detail
								? data.detail.msg
									? data.detail.msg
									: data.detail
								: "Unknown error."
						);
					} else {
						resolve(data);
					}
				} else {
					reject("Invalid response body received.");
				}
			});
	});

	return promise;
}
