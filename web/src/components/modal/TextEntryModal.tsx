import React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ValidatedData, ValidatedTextField} from "jmp-coreui";

const useStyles = makeStyles()(() => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 20
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: "bold",
		textTransform: "none"
	}
}));

interface Props {
	open: boolean;
	setOpen: (o: boolean) => void;
	title: string;
	description?: string;
	value: ValidatedData;
	setValue: (v: ValidatedData) => void;
	invalidLabel?: string;
	disabled?: boolean;
	onConfirm?: () => void;
}

const TextEntryModal: React.FC<Props> = ({open, setOpen, title, description, value, setValue, invalidLabel, disabled, onConfirm}): JSX.Element => {
	const {classes} = useStyles();

	const handleClose = (): void => {
		setOpen(false);
	}

	const handleConfirm = (): void => {
		onConfirm?.();
		handleClose();
	}

	return <Dialog
		fullWidth
		maxWidth="sm"
		open={open}
		onClose={handleClose}>
		<DialogTitle>
			<Typography
				className={classes.title}>
				{title}
			</Typography>
		</DialogTitle>
		<DialogContent>
			{description && <DialogContentText
				sx={{fontSize: 14}}>
				{description}
			</DialogContentText>}
			<ValidatedTextField
				data={value}
				setData={setValue}
				invalidLabel={invalidLabel || "Invalid data has been entered."}
				fieldProps={{
					sx: {mt: 1},
					required: true,
					variant: "filled",
					id: "txt-value",
					fullWidth: true,
					disabled: disabled
				}}
			/>
		</DialogContent>
		<DialogActions>
			<Button
				className={classes.button}
				disabled={disabled}
				onClick={handleClose}>
				Cancel
			</Button>
			<Button
				className={classes.button}
				disabled={disabled || !value.value || value.error !== ""}
				color="primary"
				onClick={handleConfirm}>
				OK
			</Button>
		</DialogActions>
	</Dialog>
}
export default TextEntryModal;
