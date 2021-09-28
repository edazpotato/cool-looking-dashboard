import { Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

export function SlideTransition(props: TransitionProps) {
	return <Slide {...props} direction="left" />;
}
