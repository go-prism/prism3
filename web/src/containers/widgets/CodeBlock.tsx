import Highlight, {defaultProps, Language} from "prism-react-renderer";
import React from "react";
import {makeStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		padding: theme.spacing(1),
		margin: 0,
		borderRadius: theme.spacing(1)
	},
	line: {
		paddingLeft: theme.spacing(1)
	}
}));

interface CodeBlockProps {
	code: string;
	language: Language;
}

const CodeBlock: React.FC<CodeBlockProps> = ({code, language}): JSX.Element => {
	const classes = useStyles();
	return (<Highlight
		{...defaultProps}
		code={code}
		language={language}>
		{({className, style, tokens, getLineProps, getTokenProps}) => (
			<pre className={`${className} ${classes.root}`} style={style}>
				{tokens.map((line, i) => (
					<div
						className={classes.line}
						key={i}>
						<div
							{...getLineProps({line, key: i})}>
							{line.map((token, key) => (
								<span key={key} {...getTokenProps({token, key})}/>
							))}
						</div>
					</div>
				))}
			</pre>
		)}
	</Highlight>);
}
export default CodeBlock;
