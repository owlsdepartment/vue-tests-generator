import * as vscode from 'vscode';
import { basename } from 'path';
import { merge } from 'lodash';

const developmentPath = 'src/';
const testsPath = 'tests/unit/specs/';

enum StoreMethod {
	Getters = 'getters',
	Actions = 'actions',
	State = 'state',
}

class TemplateBuilder {
	fileName: string = '';
	filePath: string = '';
	storeMappings: { [key: string]: { [key: string]: Array<string> } } = {};

	setFileName(fileName: string): TemplateBuilder {
		this.fileName = fileName;

		return this;
	}
	
	setPath(filePath: string): TemplateBuilder {
		this.filePath = filePath;

		return this;
	}

	addStoreMappings(storeMappings: { [key: string]: { [key: string]: Array<string> } }) {
		this.storeMappings = storeMappings;
	}

	getGettres() {
		return Object.entries(this.storeMappings).map(([key, storeMethod]) => {
			const storeMethodMocked = Object.entries(storeMethod).map(([key, array]) => {
				const keys = array
					.map((el: string) => `${el}: jest.fn()\n      `)
					.reduce((acc: string, curr: string) => (`${acc}${curr}`), '')
					.trim()
					.replace(/\n$/, "");

				return `
    ${key}: {
      ${keys},
    },`;
			})
				.reduce((acc: string, curr: string) => (`${acc}${curr}`), '')
				.trim()
				.replace(/^\n/, "");

			return `
  ${key}: {
	  ${storeMethodMocked}
  },`;
		})
			.reduce((acc: string, curr: string) => (`${acc}${curr}`), '')
			.trim()
			.replace(/^\n/, "");
	}

	getTempate(): string {
		return `
import { shallowMount } from '@vue/test-utils'

import ${this.fileName} from '@/${this.filePath}'

import createStore from '%/unit/helpers/createStore'

const { localVue, store } = createStore({
${this.getGettres()}
})

const createWrapper = () => shallowMount(${this.fileName}, {
  localVue,
  store,
})

describe('${this.fileName}', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders', () => {
    const wrapper = createWrapper()

    expect(wrapper.exists()).toBeTrue()
  })
})
`;
	}
}

class TestsFileGenerator {
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

	getTestFileUri() : vscode.Uri {
		return vscode.Uri.file(this.testFilePath);
	}

	create() : void {
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

	mapWithNamespace(getters: RegExpMatchArray, type: StoreMethod) {
		const storeMethodExtrudingRegexp = {
			[StoreMethod.Getters]: /(?<=...mapGetters\(')([^\(.]+)(?=', \[)/gs,
			[StoreMethod.Actions]: /(?<=...mapActions\(')([^\(.]+)(?=', \[)/gs,
			[StoreMethod.State]: /(?<=...mapState\(')([^\(.]+)(?=', \[)/gs,
		};

		return getters.reduce((acc, curr) => {
			const namesaceName = curr.match(storeMethodExtrudingRegexp[type])?.[0] || '';
			const gettersList: any = curr.match(/(?<=\[)(.*)\'(?=,)/gs)?.[0];
			const gettersNames: Array<string> = JSON.parse(`{ "list": [${gettersList.replace(/\'/gs, '"')}] }`)?.list;

			return {
				...acc,
				[namesaceName]: {
					[type]: gettersNames,
				}
			};
		}, {});
	}

	insertGeneratedContent() {
		const workspaceEdit = new vscode.WorkspaceEdit();
		const startOfFile = new vscode.Position(0, 0);

		workspaceEdit.insert(this.getTestFileUri(), startOfFile, this.templateBuilder.getTempate());
		vscode.workspace.applyEdit(workspaceEdit).then(() => {
			vscode.window.showInformationMessage('Template was generated!');
		});
	}
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.createTest', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document?.fileName || '';
		if (currentFilePath) {
			const generator = new TestsFileGenerator(currentFilePath);
			generator.extrudeStore();
			generator.create();
			// const templateBuilder = new TemplateBuilder()
			// 	.setFileName('Array')
			// 	.setPath('views/Array.vue')
			// 	.addGetters('loading', ['getLoadingStatesForActions'])
			// 	.addGetters('user', ['getCurrentUserFirstName']);

			// console.log(templateBuilder.getTempate());
		} else {
			vscode.window.showErrorMessage('Cannot create test for unnamed file!');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
