import ab2str from './util/ab2str';

const evalGlobal = eval;

const makeSourceURL = (name) => `${name} | GM Module`.replace(/ /g, '%20');

let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;
};

export const importModule = async (f, disabled = false) => {
  let field = f.name;

  hypercordScope.logger.debug('import', `Importing module: "${field}"`);

  if (hypercordScope.modules[field]?.hypercordHandlers?.onImport !== undefined) {
    hypercordScope.logger.debug(`import.load.module.${field}`, 'Module already imported, removing then installing new version');

    await hypercordScope.modules[field].hypercordHandlers.onRemove();
  }

  if (typeof f.data === 'object') { // ArrayBuffer (UTF-8) -> String
    f.data = ab2str(f.data);
  }

  const modulesKey = !disabled ? 'modules' : 'disabledModules';

  hypercordScope[modulesKey][field] = Object.assign(evalGlobal(`const hypercordScope=hypercord;` + f.data + ` //# sourceURL=${makeSourceURL(f.name)}`), f.metadata); // Set hypercordScope.modules.<module_name> to the return value of the module (an object containing handlers)

  if (disabled) return;


  await hypercordScope.modules[field].hypercordHandlers.onImport(); // Run the module's onImport handler
};