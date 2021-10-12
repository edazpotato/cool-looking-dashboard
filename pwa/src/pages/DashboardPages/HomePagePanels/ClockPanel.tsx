import {
	FormControlLabel,
	FormGroup,
	Paper,
	Stack,
	Switch,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

import createPersistedState from "use-persisted-state";

const use12HourModeState = createPersistedState("12-hour-mode");
const useShowMillisecondsState = createPersistedState("show-milliseconds");
export function ClockPanel() {
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	const [time, setTime] = useState(Date.now());
	const [twelveHourMode, setTwelveHourMode] = use12HourModeState(true);
	const [showMilliseconds, setShowMilliseconds] =
		useShowMillisecondsState(false);
	useEffect(() => {
		function updateTime() {
			setTime(() => {
				return Date.now();
			});
		}
		const timeout = setInterval(updateTime, 17);
		return () => {
			clearInterval(timeout);
		};
	}, [setTime]);

	function formatTime(num: number, milliseconds?: boolean): string {
		if (num < 10) return (milliseconds ? "00" : "0") + num;
		if (num < 100) return (milliseconds ? "0" : "") + num;
		return num + "";
	}

	const date = new Date(time);
	let hours: string | number = date.getHours();
	const suffix = hours >= 12 ? "PM" : "AM";
	if (twelveHourMode)
		hours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
	hours = formatTime(hours);
	let minutes: string | number = date.getMinutes();
	minutes = formatTime(minutes);
	let seconds: string | number = date.getSeconds();
	seconds = formatTime(seconds);
	let milliseconds: string | number = date.getMilliseconds();
	milliseconds = formatTime(milliseconds, true);

	return (
		<Paper
			sx={{
				p: 4,
				flex: "1",
				position: "relative",
				display: "flex",
				flexDirection: "column",
				gap: 4,
				minWidth: "50%",
			}}
		>
			<Stack
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					flexWrap: "wrap",
					wordWrap: "break-word",
				}}
			>
				<Typography
					variant={onDesktop ? "h2" : "h4"}
					sx={{ textAlign: "center" }}
				>
					{`${hours}:${minutes}:${seconds}${
						showMilliseconds ? ":" + milliseconds : ""
					}${twelveHourMode ? " " + suffix : ""}`}
				</Typography>
				<Typography variant={onDesktop ? "h4" : "h6"}>
					{date.toLocaleDateString()}
				</Typography>
			</Stack>
			<FormGroup>
				<FormControlLabel
					control={
						<Switch
							checked={twelveHourMode}
							onChange={(e) =>
								setTwelveHourMode(e.target.checked)
							}
						/>
					}
					label="12-hour mode"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={showMilliseconds}
							onChange={(e) =>
								setShowMilliseconds(e.target.checked)
							}
						/>
					}
					label="Show milliseconds"
				/>
			</FormGroup>
		</Paper>
	);
}
