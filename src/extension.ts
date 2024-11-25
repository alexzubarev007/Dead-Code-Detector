import * as vscode from 'vscode';
const red_highlight = vscode.window.createTextEditorDecorationType({
	backgroundColor: 'rgba(255,0,0,0)',
	border: '1px solid red',
})

export function activate(context: vscode.ExtensionContext) {

	console.log("Plugin is active!");
	vscode.window.showInformationMessage('Plugin is active!');

	const disposable = vscode.commands.registerCommand('extension.detectDeadCode', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('Invalid call!');
			return;
		}
		
		const text = editor.document.getText();
		editor.setDecorations(red_highlight, []); 
		const variable_regular = /\b(int|float|double|char|std::string|bool|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b(?!\s*\()/g;
		const function_regular = /\b[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{?/g;
		const unused: vscode.DecorationOptions[] = [];
		let match;
		while ((match = variable_regular.exec(text)) !== null) {
			const [full_match, , part_of_variable] = match;
			const begin = editor.document.positionAt(match.index);
			const end = editor.document.positionAt(match.index + match[0].length);
			const variable_length = new vscode.Range(begin, end);
			if (!text.includes(part_of_variable, match.index + match[0].length) ) {
				unused.push({
					range: variable_length,
					hoverMessage: `Unused variable: ${part_of_variable}`,
				}
				)
			}
		}

		while ((match = function_regular.exec(text)) !== null) {
			const [full_match, , part_of_function] = match;
			const begin = editor.document.positionAt(match.index);
			const end = editor.document.positionAt(match.index + match[0].length);
			const function_length = new vscode.Range(begin, end);
			const function_name_match = /[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.exec(full_match);
			if (function_name_match) {
				const function_name = function_name_match[0].replace('(', '').trim();

				if (function_name == 'main') {
					continue;
				}
				if (!text.includes(function_name, match.index + full_match.length) ) {
					unused.push({
						range: function_length,
						hoverMessage: `Unused function: ${function_name}`
					});
				}
			}
		}

		
		editor.setDecorations(red_highlight, unused);
		vscode.window.showInformationMessage('Dead code Detected');

	});
	context.subscriptions.push(disposable);
}


export function deactivate() { }
