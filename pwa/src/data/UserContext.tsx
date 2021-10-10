import { ReactChild, createContext, useState } from "react";

export type UserData =
	| {
			loggedIn: false;
	  }
	| {
			loggedIn: true;
			name: string;
			token: string;
			tokenEpiresAt: number;
			autoLogOutTimeout: ReturnType<typeof setTimeout>;
	  };
export type SetUserFunction = (
	thing: ((oldState: UserData) => UserData) | UserData
) => any;

export const defaultUserContext: UserData = { loggedIn: false };
export const UserContext = createContext<[UserData, SetUserFunction]>([
	defaultUserContext,
	() => {},
]);

interface UserContextProviderProps {
	children: ReactChild | ReactChild[];
}
export function UserContextProvider({ children }: UserContextProviderProps) {
	const [user, setUser] = useState<UserData>(defaultUserContext);
	window.user = user;
	window.setUser = setUser;

	return (
		<UserContext.Provider value={[user, setUser]}>
			{children}
		</UserContext.Provider>
	);
}

declare global {
	interface Window {
		user: any;
		setUser: any;
	}
}
