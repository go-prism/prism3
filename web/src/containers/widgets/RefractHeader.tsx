import {ListItem, ListItemIcon, ListItemText, makeStyles, Typography} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import React from "react";
import {useTheme} from "@material-ui/core/styles";
import {getRemoteIcon} from "../../utils/remote";
import {Archetype, Refraction} from "../../graph/types";

const useStyles = makeStyles(() => ({
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
	const classes = useStyles();

	return <ListItem>
		<ListItemIcon>
			{loading ? <Skeleton variant="circle" animation="wave" width={48} height={48}/> : getRemoteIcon(theme, refraction?.archetype || Archetype.NONE)}
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
	</ListItem>;
}
export default RefractHeader;
