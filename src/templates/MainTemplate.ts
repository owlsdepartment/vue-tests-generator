import TemplateFactory from "./TemplateFactory";
import mainTemplate from './resources/mainTemplate';

export default class MainTemplate extends TemplateFactory {
  getTemplate({ fileName = '', filePath = '', mockedStore = '{}', mockedRouter = '{}', }): string {
    return mainTemplate({ fileName, filePath, mockedStore, mockedRouter });
  }
}