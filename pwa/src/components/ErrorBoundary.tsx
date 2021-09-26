import { Box, Stack } from "@mui/material";
import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryState {
	error: null | Error;
	errorInfo: null | ErrorInfo;
}

interface ErrorBoundaryProps {
	children: ReactNode;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null, errorInfo: null };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Catch errors in any components below and re-render with error message
		this.setState({
			error: error,
			errorInfo: errorInfo,
		});
		// You can also log error messages to an error reporting service here
	}

	render() {
		if (this.state.errorInfo) {
			// You can render any custom fallback UI
			return (
				<Stack>
					<h1>Something went wrong.</h1>
					{this.state.error && this.state.error.toString()}
					<br />
					{this.state.errorInfo.componentStack}
				</Stack>
			);
		}

		return this.props.children;
	}
}
