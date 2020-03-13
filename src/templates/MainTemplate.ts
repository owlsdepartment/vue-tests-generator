import TemplateFactory from "./TemplateFactory";
import mainTemplate from './resources/mainTemplate';

export default class MainTemplate extends TemplateFactory {
  getTemplate({ fileName = '', filePath = '', mockedStore = '{}' }): string {
    return mainTemplate({ fileName, filePath, mockedStore });
  }
}