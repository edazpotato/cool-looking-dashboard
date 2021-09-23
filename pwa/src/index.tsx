import "./index.css";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import App from "./App";
import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { UserContextProvider } from "./data";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
	<React.StrictMode>
		<CssBaseline />
		<UserContextProvider>
			<App />
		</UserContextProvider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
window.serviceWorkerRegistration = serviceWorkerRegistration;

declare global {
	interface Window {
		serviceWorkerRegistration: any;
	}
}
