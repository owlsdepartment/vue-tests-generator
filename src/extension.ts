import * as vscode from 'vscode';

import TestsFileGenerator from './TestsFileGenerator';
import HelpersGnerator from './HelpersGenerator';

import { GenerateMode } from './types';
import { GeneratorInterface } from './GeneratorInterface';

const currentFilePath =
  vscode.window.activeTextEditor?.document?.fileName || '';
const config = vscode.workspace.getConfiguration('vue-tests-generator');
const { developmentPath, testsPath, testsHelpersPath } = config || {};
const localConfig = {
  developmentPath,
  testsPath,
  testsHelpersPath,
};

function generateFiles() {
	const generators: Array<GeneratorInterface> = [
		new TestsFileGenerator(
			localConfig,
			currentFilePath,
			GenerateMode.WithStore,
		),
		new HelpersGnerator(
			localConfig,
			currentFilePath,
		),
	];

	generators.forEach(generator => generator.create());
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.createTest', () => {
		if (currentFilePath) {
			generateFiles();
		} else {
			vscode.window.showErrorMessage('Cannot create test for unnamed file!');
		}
	});
 
	context.subscriptions.push(disposable);
}

export function deactivate() {}
