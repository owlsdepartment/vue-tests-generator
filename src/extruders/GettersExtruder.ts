import StoreExtruder from "./StoreExtruder";
import { StoreMethod } from '../types';

export default class GettersExtruder extends StoreExtruder {
  constructor(fileContent: string) {
    super(fileContent, StoreMethod.Getters);
  }

  getStoreMappingsExtrudingRegexp(): RegExp {
    return /...mapGetters\(([^\(.]+)]\),/gs;
  }
  getNamespaceExtrudingMethod(): RegExp {
    return /(?<=...mapGetters\(')([^\(.]+)(?=', \[)/gs;
  }
  getMappingValue(): string {
    return 'jest.fn()';
  }
}