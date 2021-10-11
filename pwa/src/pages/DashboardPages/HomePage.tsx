import {
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import {
	Paper,
	Stack,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useContext, useEffect, useRef } from "react";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { UserContext } from "../../data";
import { useSnackbar } from "notistack";

const globeRadius = 30;

export function HomePage() {
	const [user] = useContext(UserContext);
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const onDesktop = useMediaQuery(theme.breakpoints.up("md"));
	const globeCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let animationFrameID: number | undefined;
		const canvas = globeCanvasRef.current;
		if (canvas) {
			const gl =
				canvas.getContext("webgl") ||
				canvas.getContext("experimental-webgl");
			if (gl && gl instanceof WebGLRenderingContext) {
				const { width, height } = canvas.getBoundingClientRect();
				const scene = new Scene();
				const camera = new PerspectiveCamera(75, width / height);
				camera.position.setZ(65);
				const renderer = new WebGLRenderer({ canvas });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(width, height);

				const controls = new OrbitControls(camera, renderer.domElement);

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

					globeShape.rotateY(0.001);
					controls.update();

					renderer.render(scene, camera);
				};
				animate();
			}
		}

		return () => {
			animationFrameID && cancelAnimationFrame(animationFrameID);
		};
	}, [globeCanvasRef, theme]);

	return user.loggedIn ? (
		<Stack>
			{!onDesktop && <Toolbar />}
			<Paper sx={{ flex: 0, width: "250px", height: "250px" }}>
				<canvas width="250" height="250" ref={globeCanvasRef} />
			</Paper>
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
