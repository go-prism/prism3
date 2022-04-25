import React from "react";
import {ErrorBoundary} from "react-error-boundary";
import {Card, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import Error from "../../../alert/Error";

const RefractAuth: React.FC = (): JSX.Element => {
	return <div>
		<ErrorBoundary
			fallbackRender={p => <Error props={p}/>}>
			<Card
				sx={{p: 2, m: 1}}
				variant="outlined">
				<FormControl
					disabled>
					<FormLabel>Authentication mode</FormLabel>
					<RadioGroup>
						<FormControlLabel
							checked
							control={<Radio/>}
							label="Pass-through"
						/>
						<FormControlLabel
							checked={false}
							control={<Radio/>}
							label="Direct"
						/>
					</RadioGroup>
					<Link to="/help">
						<Typography
							sx={{fontSize: 14}}
							color="color.primary">
							What does this mean?
						</Typography>
					</Link>
				</FormControl>
			</Card>
		</ErrorBoundary>
	</div>
}
export default RefractAuth;
