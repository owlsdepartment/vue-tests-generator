export default ({
  fileName = '',
  filePath = '',
  mockedStore = '{}',
  mockedRouter = '{}',
}): string => (
`import { shallowMount } from '@vue/test-utils'

import ${fileName} from '@/${filePath}'

import createStore from '%/unit/helpers/createStore'

const mocks = ${mockedRouter}

const { localVue, store } = createStore(${mockedStore})

const createWrapper = () => shallowMount(${fileName}, {
  localVue,
  store,
  mocks,
})

describe('${fileName}', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders', () => {
    const wrapper = createWrapper()

    expect(wrapper.exists()).toBeTrue()
  })
})
`
);