import StoreExtruder from "./StoreExtruder";
import { StoreMethod } from '../types';

export default class MutationsExtruder extends StoreExtruder {
  constructor(fileContent: string) {
    super(fileContent, StoreMethod.Mutations);
  }

  getStoreMappingsExtrudingRegexp(): RegExp {
    return /...mapMutations\(([^\(.]+)]\),/gs;
  }
  getNamespaceExtrudingMethod(): RegExp {
    return /(?<=...mapMutations\(')([^\(.]+)(?=', \[)/gs;
  }
  getMappingValue(): string {
    return 'jest.fn()';
  }
}