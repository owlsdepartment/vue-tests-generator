# vue-tests-generator README

This is Visual Studio Code extension built to make faster tedious doings
related with writing unit tests for vue applications
using jest and vue-test-utils

## Features

- creating essential tests based on .vue component or view
- mocking vuex store state, actions, getters, mutations used in vue file

## Requirements

- At least Visual studio code 1.43

## Extension Settings

If you have some unstandard folders structure, for examples test are in different location than `test/unit/specs/` Then you can specify your own paths in settings.json with options described below:

* `vue-tests-generator.developmentPath` : `"src/"` - path where are all of your development files
*  `vue-tests-generator.testsPath`: `"tests/unit/specs/"` - path where your unit tests have to be stored
