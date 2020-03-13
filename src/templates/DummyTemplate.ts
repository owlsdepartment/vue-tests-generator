import TemplateFactory from "./TemplateFactory";

export default class DummyTemplate extends TemplateFactory {
  getTemplate(): string {
    return 'dummy';
  }
}