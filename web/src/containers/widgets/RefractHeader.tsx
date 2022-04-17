import {ListItem, ListItemIcon, ListItemText, Skeleton, Typography} from "@mui/material";
import React from "react";
import {makeStyles} from "tss-react/mui";
import {useTheme} from "@mui/material/styles";
import {getRemoteIcon} from "../../utils/remote";
import {Archetype, Refraction} from "../../generated/graphql";

const useStyles = makeStyles()(() => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
	}
}));

interface RefractHeaderProps {
	refraction: Refraction | null;
	loading?: boolean;
}

const RefractHeader: React.FC<RefractHeaderProps> = ({refraction, loading}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {classes} = useStyles();

	return (
		<ListItem>
			<ListItemIcon>
				{loading ? <Skeleton variant="circular" animation="wave" width={48} height={48}/> : getRemoteIcon(theme, refraction?.archetype || Archetype.Generic)}
			</ListItemIcon>
			<ListItemText
				disableTypography
				secondary={<Typography
					color="textSecondary">
					{loading ? <Skeleton animation="wave" width="15%"/> : <span>
                        Refraction ID: <span>
							{refraction?.id}
						</span>
					</span>}
				</Typography>}>
				<Typography
					className={classes.title}
					color="textPrimary"
					variant="h4">
					{loading ? <Skeleton animation="wave" width="25%" height={64}/> : refraction?.name}
				</Typography>
			</ListItemText>
		</ListItem>
	);
}
export default RefractHeader;
