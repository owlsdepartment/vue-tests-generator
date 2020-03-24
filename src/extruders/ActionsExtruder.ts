import StoreExtruder from "./StoreExtruder";
import { StoreMethod } from "../types";

export default class ActionsExtruder extends StoreExtruder {
  constructor(fileContent: string) {
    super(fileContent, StoreMethod.Actions);
  }

  getStoreMappingsExtrudingRegexp(): RegExp {
    return /...mapActions\(([^\(.]+)]\),/gs;
  }
  getNamespaceExtrudingMethod(): RegExp {
    return /(?<=...mapActions\(')([^\(.]+)(?=', \[)/gs;
  }
  getMappingValue(): string {
    return 'jest.fn()';
  }
}