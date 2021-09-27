import { ReactChild, createContext, useState } from "react";

export type UserData =
	| {
			loggedIn: false;
	  }
	| { loggedIn: true; name: string; token: string; tokenEpiresAt: number };

export const defaultUserContext: UserData = { loggedIn: false };
export const UserContext = createContext<
	[UserData, (thing: ((oldState: UserData) => UserData) | UserData) => any]
>([defaultUserContext, () => {}]);

interface UserContextProviderProps {
	children: ReactChild | ReactChild[];
}
export function UserContextProvider({ children }: UserContextProviderProps) {
	const [user, setUser] = useState<UserData>(defaultUserContext);

	return (
		<UserContext.Provider value={[user, setUser]}>
			{children}
		</UserContext.Provider>
	);
}
