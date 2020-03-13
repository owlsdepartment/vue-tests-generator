import * as vscode from 'vscode';
import TestsFileGenerator from './TestsFileGenerator';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.createTest', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document?.fileName || '';
		if (currentFilePath) {
			const generator = new TestsFileGenerator(currentFilePath);
			generator.extrudeStore();
			generator.create();
		} else {
			vscode.window.showErrorMessage('Cannot create test for unnamed file!');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
