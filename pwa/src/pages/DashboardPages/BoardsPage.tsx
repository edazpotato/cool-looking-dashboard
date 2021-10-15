import { ForwardedRef, forwardRef } from "react";

import { Stack } from "@mui/material";

export const BoardsPage = forwardRef((_, ref: ForwardedRef<any>) => {
	return <Stack ref={ref}></Stack>;
});
