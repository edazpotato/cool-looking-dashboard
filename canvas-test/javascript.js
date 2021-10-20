let previousTimestamp;

function draw(timestamp, ctx) {
	const deltaTime = timestamp - previousTimestamp;
	previousTimestamp = timestamp;

	requestAnimationFrame((delta) => draw(delta, ctx));

	console.log(deltaTime);
}

window.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	window.ctx = ctx;

	requestAnimationFrame((delta) => draw(delta, ctx));
});
