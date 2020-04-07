export default class RouterExtruder {
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  getRouterMethodsExtrudeRegexp(): RegExp {
    return /(?<=this\.\$router\.)[a-z]+(?=\()/gs;
  }

  getMockedRouter() : {} {
    const $router: { [key: string]: string } = {};
    const extrudedMethods = this.getRouterMethodsExtrudeRegexp();
    const matched = this.text.match(extrudedMethods);

    matched?.forEach(match => {
      if (!$router.hasOwnProperty(match)) {
        $router[match] = 'jest.fn()';
      }
    });

    return { $router };
  }
} 