import * as vscode from 'vscode';

import TestsFileGenerator from './TestsFileGenerator';
import HelpersGnerator from './HelpersGenerator';

import { GenerateMode } from './types';

const currentFilePath =
  vscode.window.activeTextEditor?.document?.fileName || '';
const config = vscode.workspace.getConfiguration('vue-tests-generator');
const { developmentPath, testsPath, testsHelpersPath } = config || {};
const localConfig = {
  developmentPath,
  testsPath,
  testsHelpersPath,
};

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.createTest', () => {
		if (currentFilePath) {
			const testsGenerator = new TestsFileGenerator(
        localConfig,
        currentFilePath,
      );

			const helpersGenerator = new HelpersGnerator(
        localConfig,
        currentFilePath,
      );

			helpersGenerator.create();
			testsGenerator.create(GenerateMode.WithStore);
		} else {
			vscode.window.showErrorMessage('Cannot create test for unnamed file!');
		}
	});
 
	context.subscriptions.push(disposable);
}

export function deactivate() {}
