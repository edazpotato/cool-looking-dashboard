import {
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import { Paper, useTheme } from "@mui/material";
import { useEffect, useRef } from "react";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const globeRadius = 30;

export function GlobePanel() {
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
