import { Alert, Button, Paper, Stack } from "@mui/material";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";

export function FFMPEGPanel() {
	const [loading, setLoading] = useState(true);
	const [video, setVideo] = useState<File | null | undefined>();
	const fileInputRef = useRef<null | HTMLInputElement>(null);
	const ffmpeg = createFFmpeg({
		log: true,
		corePath:
			process.env.NODE_ENV === "development"
				? "http://localhost:3000/public/ffmpeg-core.js"
				: undefined,
	});

	useEffect(() => {
		async function load() {
			await ffmpeg.load();
			console.log("Loaded");
			setLoading(false);
		}
		load();
	}, [ffmpeg]);

	return (
		<Paper
			sx={{
				p: 4,
				flex: 2,
				minWidth: "50%",
			}}
		>
			{loading ? (
				<Alert severity="info">Loading FFMPEG....</Alert>
			) : (
				<Stack>
					{video && (
						<video
							controls
							width="250"
							src={URL.createObjectURL(video)}
						></video>
					)}
					<Button
						onClick={() => {
							if (fileInputRef) {
								if (fileInputRef.current) {
									fileInputRef.current.click();
								}
							}
						}}
					>
						Choose video file
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						onChange={(e) => setVideo(e.target.files?.item(0))}
						style={{ display: "none" }}
					/>
				</Stack>
			)}
		</Paper>
	);
}
