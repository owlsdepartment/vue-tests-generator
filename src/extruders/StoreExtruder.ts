import { StoreMethod } from '../types';

export default abstract class StoreExtruder {
  type: StoreMethod;
  fileContent: string;

  constructor(fileContent: string, type: StoreMethod) {
    this.fileContent = fileContent;
    this.type = type;
  }
  
  abstract getMappingValue(): string;
  
  abstract getStoreMappingsExtrudingRegexp(): RegExp;

  abstract getNamespaceExtrudingMethod(): RegExp;

  extrudeStoreMappings(text: string): RegExpMatchArray {
    return text.match(this.getStoreMappingsExtrudingRegexp()) || [];
  }

  extrudeNamespace(storeMapping: string): string {
    const [matchedNamespace] = storeMapping
      .match(this.getNamespaceExtrudingMethod()) || [];

    return matchedNamespace || '';
  }

  extrudeMappedNames(storeMapping: string): Array<string> {
    const [mappingsList] = storeMapping.match(/(?<=\[)(.*)\'(?=,)/gs) || [''];
    const parsedNames = JSON.parse(`{ "list": [${mappingsList.replace(/\'/gs, '"')}] }`);

    return parsedNames?.list || [];
  }

  getMockedNames(namesList: Array<string>): { [key: string]: string} {
    return namesList.reduce((acc, curr) => (
      { ...acc, [curr]: this.getMappingValue() }
    ), {});
  }

  mapWithNamespace(): {} {
    const storeMappings = this.extrudeStoreMappings(this.fileContent);

    return storeMappings.reduce((acc, curr) => {
      const namesaceName = this.extrudeNamespace(curr);
      const mappedNamesList = this.extrudeMappedNames(curr);
      const mockedNames = this.getMockedNames(mappedNamesList);

      return {
        ...acc,
        [namesaceName]: {
          [this.type]: mockedNames,
        }
      };
    }, {});
  }
}