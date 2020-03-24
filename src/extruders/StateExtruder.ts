import StoreExtruder from "./StoreExtruder";
import { StoreMethod } from '../types';

export default class StateExtruder extends StoreExtruder {
  constructor(fileContent: string) {
    super(fileContent, StoreMethod.State);
  }

  getStoreMappingsExtrudingRegexp(): RegExp {
    return /...mapState\(([^\(.]+)]\),/gs;
  }
  getNamespaceExtrudingMethod(): RegExp {
    return /(?<=...mapState\(')([^\(.]+)(?=', \[)/gs;
  }
  getMappingValue(): string {
    return '{}';
  }
}