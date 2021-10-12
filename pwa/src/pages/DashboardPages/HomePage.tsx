import {
	FormControlLabel,
	FormGroup,
	Paper,
	Stack,
	Switch,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import {
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import { useContext, useEffect, useRef, useState } from "react";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { UserContext } from "../../data";
import createPersistedState from "use-persisted-state";

export function HomePage() {
	const [user] = useContext(UserContext);
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));

	return user.loggedIn ? (
		<Stack sx={{ px: 4, py: onDesktop ? 4 : 0 }} gap={4}>
			{!onDesktop && <Toolbar />}
			<Stack
				direction="row"
				gap={4}
				sx={{
					flexWrap: "wrap",
					justifyContent: onDesktop ? "flex-start" : "center",
				}}
			>
				<ClockPanel />
				<GlobePanel />
			</Stack>
			<Typography>
				{user.name}, you are logged in! Your current session expires at{" "}
				{new Date(user.tokenEpiresAt).toLocaleTimeString()}.
			</Typography>
		</Stack>
	) : (
		<Typography>
			Soemthing weird is happening. The dashboard homepage is trying to
			render but you aren{"'"}t logged in.
		</Typography>
	);
}

const use12HourModeState = createPersistedState("12-hour-mode");
const useShowMillisecondsState = createPersistedState("show-milliseconds");
function ClockPanel() {
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

const globeRadius = 30;

function GlobePanel() {
	const theme = useTheme();
	const globeCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let animationFrameID: number | undefined;
		const canvas = globeCanvasRef.current;
		let renderer: WebGLRenderer | undefined;
		if (canvas) {
			const gl =
				canvas.getContext("webgl") ||
				canvas.getContext("experimental-webgl");
			if (gl && gl instanceof WebGLRenderingContext) {
				const { width, height } = canvas.getBoundingClientRect();
				const scene = new Scene();
				const camera = new PerspectiveCamera(75, width / height);
				camera.position.setZ(65);
				renderer = new WebGLRenderer({ canvas });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(width, height);

				const controls = new OrbitControls(camera, renderer.domElement);
				controls.autoRotateSpeed = 1.2;
				controls.autoRotate = true;
				controls.enableDamping = true;

				const globeGeometry = new SphereGeometry(globeRadius);
				const globeMaterial = new MeshBasicMaterial({
					color: theme.palette.primary.dark,
					wireframe: true,
				});

				const globeShape = new Mesh(globeGeometry, globeMaterial);
				globeShape.rotateX(10);

				scene.add(globeShape);

				const animate = () => {
					animationFrameID = requestAnimationFrame(animate);

					// globeShape.rotateY(0.001);
					controls.update();

					renderer && renderer.render(scene, camera);
				};
				animate();
			}
		}

		return () => {
			animationFrameID && cancelAnimationFrame(animationFrameID);
			renderer && renderer.dispose();
		};
	}, [globeCanvasRef, theme]);

	return (
		<Paper sx={{ flex: 0, width: "250px", height: "250px" }}>
			<canvas width="250" height="250" ref={globeCanvasRef} />
		</Paper>
	);
}
