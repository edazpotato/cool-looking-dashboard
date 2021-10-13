import { Alert, Button, Paper, Stack } from "@mui/material";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useRef, useState } from "react";

const ffmpeg = createFFmpeg({
	log: true,
	corePath:
		process.env.NODE_ENV === "development"
			? "http://localhost:3000/ffmpeg-core.js"
			: undefined,
});

export function FFMPEGPanel() {
	const [loading, setLoading] = useState<null | boolean>(null);
	const [input, setInput] = useState<File | null | undefined>();
	const [output, setOutput] = useState<string | undefined>();
	const fileInputRef = useRef<null | HTMLInputElement>(null);

	async function loadFFMPEG() {
		setLoading(true);
		await ffmpeg.load();
		setLoading(false);
	}

	async function convertVideoToGif() {
		if (!input) return;
		// Write the file to memory
		ffmpeg.FS("writeFile", "test.mp4", await fetchFile(input));

		// Run the FFMpeg command
		await ffmpeg.run(
			"-i",
			"test.mp4",
			"-t",
			"5.0",
			"-ss",
			"2.0",
			"-f",
			"gif",
			"out.gif"
		);

		// Read the result
		const data = ffmpeg.FS("readFile", "out.gif");

		// Create a URL
		const url = URL.createObjectURL(
			new Blob([data.buffer], { type: "image/gif" })
		);
		setOutput(url);
	}

	return (
		<Paper
			sx={{
				p: 4,
				flex: 1,
				minWidth: "50%",
				alignItems: "center",
			}}
		>
			<Alert severity="warning">
				{loading !== false && "Once loaded, "}FFMPEG wil cause a memory
				leak that will cause the page to crash
				{loading === false ? " in" : " after"} ~1 minute.
			</Alert>
			{loading === null ? (
				<Button
					color="warning"
					variant="contained"
					onClick={loadFFMPEG}
				>
					Load FFMPEG
				</Button>
			) : loading === true ? (
				<Alert severity="info">Loading FFMPEG....</Alert>
			) : (
				<Stack>
					<input
						ref={fileInputRef}
						type="file"
						onChange={(e) => setInput(e.target.files?.item(0))}
						style={{ display: "none" }}
					/>
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
					{input && (
						<>
							<video
								style={{ maxWidth: "250px" }}
								loop
								autoPlay
								controls={false}
								src={URL.createObjectURL(input)}
							></video>

							<Button onClick={convertVideoToGif}>
								Convert to GIF
							</Button>
							{output && (
								<>
									<img
										style={{ maxWidth: "250px" }}
										src={output}
										alt="Conversion output"
									/>
									<Button download href={output}>
										Download
									</Button>
								</>
							)}
						</>
					)}
				</Stack>
			)}
		</Paper>
	);
}
