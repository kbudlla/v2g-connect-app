module.exports = {
  printWidth: 120,
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: 'always',
  jsxSingleQuote: false,

  // Settings for the import-order
  importOrder: [
    // React, react-router, etc
    '^react(.*)$',

    // Types, either local or from /src, but max one level up
    '^(((\\.\\/){0,}|(\\.\\.\\/))types|(.*)\\/types)(.*)$',

    // config
    '^config.*$',

    // api or axios
    '^(api|axios)(.*)$',

    // core-modules
    '^(core)(.*)$',

    // component libraries
    '^(antd)(.*)$',

    // Local components and modals
    '^(components)(.*)$',

    // Routes
    '^routes(.*)$',

    // Theme and local style-definitions
    '^(theme|((\\.\\/){0,}|(\\.\\.\\/))styles|.*.(s*css))(.*)$',

    // Utils
    '^(utils|clsx|nanoid|lodash-es|i18n|i18next)(.*)$',

    // testing Utils
    '^(@testing-library)(.*)$',

    // Local imports, either on current level, or one above
    '^(\\.|\\.\\.)\\/*([^.]*)$',

    // Relative Imports of non-local files (../../{more}), more than one level up
    '^(\\.\\.\\/){2,}',

    // Anything else:
    '^.*$',
  ],
  importOrderCaseInsensitive: true,
  importOrderSeparation: true
}
