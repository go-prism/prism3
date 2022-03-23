import React from "react";
import {makeStyles, Theme} from "@material-ui/core";
import {androidstudio, github} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {useTheme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		padding: theme.spacing(1),
		margin: 0,
		borderRadius: theme.spacing(1)
	}
}));

interface CodeBlockProps {
	code: string;
	language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({code, language}): JSX.Element => {
	const theme = useTheme();
	const classes = useStyles();
	return <div
		className={classes.root}>
		<SyntaxHighlighter
			language={language}
			style={theme.palette.type === "light" ? github : androidstudio}>
			{code}
		</SyntaxHighlighter>
	</div>;
}
export default CodeBlock;
