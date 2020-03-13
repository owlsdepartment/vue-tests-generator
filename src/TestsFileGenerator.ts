import * as vscode from 'vscode';
import { basename } from 'path';
import { merge } from 'lodash';
import TemplateBuilder from './TemplateBuilder';

const developmentPath = 'src/';
const testsPath = 'tests/unit/specs/';

enum StoreMethod {
  Getters = 'getters',
  Actions = 'actions',
  State = 'state',
}

export default class TestsFileGenerator {
  testFilePath: string;
  templateBuilder: TemplateBuilder;
  fullPath: string;

  constructor(currentFilePath: string) {
    const [basePath, relativeFilePath] = currentFilePath.split(developmentPath);
    const fileName = basename(currentFilePath)
      .replace('.vue', '');

    this.fullPath = currentFilePath;
    this.testFilePath = `${basePath}${testsPath}${relativeFilePath}`.replace('.vue', '.spec.js');
    this.templateBuilder = new TemplateBuilder()
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

  extrudeStore() {
    vscode.workspace.openTextDocument(this.fullPath).then((document) => {
      const text = document.getText();
      const getters = this.extrudeStoreMethod(text, StoreMethod.Getters);
      const actions = this.extrudeStoreMethod(text, StoreMethod.Actions);
      const state = this.extrudeStoreMethod(text, StoreMethod.State);

      const extrudedStoreMappings = merge(
        this.mapWithNamespace(getters, StoreMethod.Getters),
        this.mapWithNamespace(actions, StoreMethod.Actions),
        this.mapWithNamespace(state, StoreMethod.State),
      );

      this.templateBuilder.addStoreMappings(extrudedStoreMappings);
    });
  }

  extrudeStoreMethod(text: String, type: StoreMethod): RegExpMatchArray {
    const storeMethodExtrudingRegexp = {
      [StoreMethod.Getters]: /...mapGetters\(([^\(.]+)]\),/gs,
      [StoreMethod.Actions]: /...mapActions\(([^\(.]+)]\),/gs,
      [StoreMethod.State]: /...mapState\(([^\(.]+)]\),/gs,
    };

    return text.match(storeMethodExtrudingRegexp[type]) || [];
  }

  mapWithNamespace(storeMethods: RegExpMatchArray, type: StoreMethod) {
    const storeMethodExtrudingRegexp = {
      [StoreMethod.Getters]: /(?<=...mapGetters\(')([^\(.]+)(?=', \[)/gs,
      [StoreMethod.Actions]: /(?<=...mapActions\(')([^\(.]+)(?=', \[)/gs,
      [StoreMethod.State]: /(?<=...mapState\(')([^\(.]+)(?=', \[)/gs,
    };

    return storeMethods.reduce((acc, curr) => {
      const namesaceName = curr.match(storeMethodExtrudingRegexp[type])?.[0] || '';
      const mappingsList: any = curr.match(/(?<=\[)(.*)\'(?=,)/gs)?.[0];
      const mappedNames: Array<string> = JSON.parse(`{ "list": [${mappingsList.replace(/\'/gs, '"')}] }`)?.list;

      const mocksedNames = mappedNames.reduce((acc, curr) => (
        { ...acc, [curr]: 'jest.fn(),' }
      ), {});

      return {
        ...acc,
        [namesaceName]: {
          [type]: mocksedNames,
        }
      };
    }, {});
  }

  insertGeneratedContent() {
    const workspaceEdit = new vscode.WorkspaceEdit();
    const startOfFile = new vscode.Position(0, 0);
    console.log(this.templateBuilder.getTempate().match(/\t/g));
    workspaceEdit.insert(this.getTestFileUri(), startOfFile, this.templateBuilder.getTempate().replace(/\t/g, ""));
    vscode.workspace.applyEdit(workspaceEdit).then(() => {
      vscode.window.showInformationMessage('Template was generated!');
    });
  }
}