import * as vscode from 'vscode';
import { basename } from 'path';
import { merge } from 'lodash';
import * as fs from 'fs';

import TemplateBuilder from './templates/TemplateBuilder';
import type { Configuration } from './types';
import {
  Template,
  GenerateMode,
} from './types';
import {
  StoreExtruder,
  GettersExtruder,
  ActionsExtruder,
  StateExtruder,
  MutationsExtruder,
} from './extruders';

import { GeneratorInterface } from './GeneratorInterface';

const defaultDevelopmentPath = 'src/';
const defaultTestsPath = 'tests/unit/specs/';

export default class TestsFileGenerator implements GeneratorInterface {
  testFilePath: string;
  templateBuilder: TemplateBuilder;
  fullPath: string;
  config: Configuration;
  gMode: GenerateMode;

  constructor(config: Configuration, currentFilePath: string, gMode: GenerateMode = GenerateMode.Basic) {
    this.config = config;
    const [basePath, relativeFilePath] = currentFilePath.split(this.getDevelopmentPath());
    const fileName = basename(currentFilePath).replace('.vue', '');

    this.gMode = gMode;
    this.fullPath = currentFilePath;
    this.testFilePath = `${basePath}${this.getTestsPath()}${relativeFilePath}`.replace('.vue', '.spec.js');
    this.templateBuilder = new TemplateBuilder(Template.Main)
      .setFileName(fileName)
      .setPath(relativeFilePath);
  }

  getDevelopmentPath() {
    return this.config?.developmentPath || defaultDevelopmentPath;
  }

  getTestsPath() {
    return this.config?.testsPath || defaultTestsPath;
  }

  getTestFileUri(): vscode.Uri {
    return vscode.Uri.file(this.testFilePath);
  }

  create(): void {
    if (this.gMode === GenerateMode.WithStore) {
      this.extrudeStore();
    }

    vscode.window.showInformationMessage(`We are crating test for ${this.testFilePath}`);
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.createFile(this.getTestFileUri(), { ignoreIfExists: true });

    vscode.workspace.applyEdit(workspaceEdit).then(() => {
      vscode.window.showInformationMessage('File with tests was created!');

      this.insertGeneratedContent();
    });
  }

  extrudeStore(): void {
    vscode.workspace.openTextDocument(this.fullPath).then((document) => {
      const text = document.getText();
      const storeExtruders: Array<StoreExtruder> = [
        new GettersExtruder(text),
        new ActionsExtruder(text),
        new StateExtruder(text),
        new MutationsExtruder(text),
      ];
      const extrudedStoreMappings = storeExtruders
        .map(extruder => extruder.mapWithNamespace());
      const mappedStore = merge(...(extrudedStoreMappings as [{}, {}, {}]));

      this.templateBuilder.setStoreMappings(mappedStore);
    });
  }

  insertGeneratedContent(): void {
    const workspaceEdit = new vscode.WorkspaceEdit();
    const startOfFile = new vscode.Position(0, 0);

    workspaceEdit.insert(this.getTestFileUri(), startOfFile, this.templateBuilder.getTemplate().replace(/\t/g, ""));
    vscode.workspace.applyEdit(workspaceEdit).then(() => {
      vscode.window.showInformationMessage('Template was generated!');
    });
  }
}