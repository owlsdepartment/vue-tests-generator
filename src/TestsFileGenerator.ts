import * as vscode from 'vscode';
import { basename } from 'path';
import { merge } from 'lodash';

import TemplateBuilder from './templates/TemplateBuilder';
import {
  StoreMethod,
  Template,
} from './enums';
import {
  StoreExtruder,
  GettersExtruder,
  ActionsExtruder,
  StateExtruder,
  MutationsExtruder,
} from './extruders';

const developmentPath = 'src/';
const testsPath = 'tests/unit/specs/';

export default class TestsFileGenerator {
  testFilePath: string;
  templateBuilder: TemplateBuilder;
  fullPath: string;

  constructor(currentFilePath: string) {
    const [basePath, relativeFilePath] = currentFilePath.split(developmentPath);
    const fileName = basename(currentFilePath).replace('.vue', '');

    this.fullPath = currentFilePath;
    this.testFilePath = `${basePath}${testsPath}${relativeFilePath}`.replace('.vue', '.spec.js');
    this.templateBuilder = new TemplateBuilder(Template.Main)
      .setFileName(fileName)
      .setPath(relativeFilePath);
  }

  getTestFileUri(): vscode.Uri {
    return vscode.Uri.file(this.testFilePath);
  }

  create(): void {
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