import * as vscode from 'vscode';
import * as fs from 'fs';

import type { Configuration } from './types';

const defaultTestsHelpersPath = 'tests/unit/helpers/';
const defaultDevelopmentPath = 'src/';
const defaultTestsPath = 'tests/unit/specs/';

export default class HelpersGenerator {
  config: Configuration;
  absoluteTestHelpersFilePath: string;

  constructor(config: Configuration, currentFilePath: string) {
    this.config = config;
    const [basePath, relativeFilePath] = currentFilePath.split(this.getDevelopmentPath());
    this.absoluteTestHelpersFilePath = `${basePath}${this.getTestsHelpersPath()}`;
  }

  getTestsHelpersPath() {
    return this.config?.testsHelpersPath || defaultTestsHelpersPath;
  }

  getDevelopmentPath() {
    return this.config?.developmentPath || defaultDevelopmentPath;
  }

  getTestsPath() {
    return this.config?.testsPath || defaultTestsPath;
  }

  generateHeleprsIfDontExist(): void {
    const workspaceEdit = new vscode.WorkspaceEdit();
    const startOfFile = new vscode.Position(0, 0);
    const dirPath = `${__dirname}/../resources/helpers/`;

    fs.readdir(dirPath, (err: any, files: any) => {
      files.forEach((file: any) => {
        const content = fs.readFileSync(`${dirPath}${file}`, 'utf8');
        const path = vscode.Uri.file(`${this.absoluteTestHelpersFilePath}${file}`);

        workspaceEdit.createFile(path, { ignoreIfExists: true });
        workspaceEdit.insert(path, startOfFile, content);
      });
      vscode.workspace.applyEdit(workspaceEdit);
    });
  }

  create(): void {
    this.generateHeleprsIfDontExist();
  }
}