export default class TemplateBuilder {
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
    return JSON.stringify(this.storeMappings, null, 2).replace(/\"/gs, '');
  }

  getTempate(): string {
    return `
import { shallowMount } from '@vue/test-utils'

import ${this.fileName} from '@/${this.filePath}'

import createStore from '%/unit/helpers/createStore'

const { localVue, store } = createStore(${this.getGettres()})

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
