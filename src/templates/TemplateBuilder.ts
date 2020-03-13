import TemplateFactory from './TemplateFactory';
import MainTemplate from './MainTemplate';
import DummyTemplate from './DummyTemplate';
import { Template } from '../enums';  

export default class TemplateBuilder {
  fileName: string = '';
  filePath: string = '';
  storeMappings: { [key: string]: { [key: string]: Array<string> } } = {};
  templateFactory: TemplateFactory;

  constructor(template: Template) {
    const templates = {
      [Template.Main]: MainTemplate,
      [Template.Dummy]: DummyTemplate,
    };

    this.templateFactory = new templates[template];
  }

  setFileName(fileName: string): TemplateBuilder {
    this.fileName = fileName;

    return this;
  }

  setPath(filePath: string): TemplateBuilder {
    this.filePath = filePath;

    return this;
  }

  setStoreMappings(storeMappings: { [key: string]: { [key: string]: Array<string> } }) {
    this.storeMappings = storeMappings;
  }

  getMockedStore() {
    return JSON.stringify(this.storeMappings, null, 2)
      .replace(/^(?!(.*{))((?!,).)*$/gm, '$&,')
      .replace(/\"/gs, '')
      .replace(/,$/gs, '');
  }

  getTemplate(): string {
    const { fileName, filePath } = this;

    return this.templateFactory.getTemplate({
      fileName,
      filePath,
      mockedStore: this.getMockedStore(),
    });
  }
}
