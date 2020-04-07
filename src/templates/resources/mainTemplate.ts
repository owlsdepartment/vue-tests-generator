export default ({ fileName = '', filePath = '', mockedStore = '{}' }): string => (
`import { shallowMount } from '@vue/test-utils'

import ${fileName} from '@/${filePath}'

import createStore from '%/unit/helpers/createStore'

const storeObject = ${mockedStore}

const { localVue, store } = createStore(storeObject)

const createWrapper = () => shallowMount(${fileName}, {
  localVue,
  store,
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