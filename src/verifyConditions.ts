import { Context } from "semantic-release";
const AggregateError = require('aggregate-error');
const {
  isArray,
  isString,
  isBoolean,
  isPlainObject,
} = require('lodash');

const verifyConditions = (pluginConfig: PluginConfiguration, context: Context) => {
  const errors: string[] = [];
  
  const { logger: { log }, env } = context;
  const {
    projectId,
    publish,
    scopeCategoryMap,
    notifySubscribers,
    defaultCategories,
  } = pluginConfig;

  if (!isString(projectId)) {
    errors.push('LaunchNotes `projectId` is required');
  }

  if (!isString(env.LAUNCHNOTES_API_KEY)) {
    errors.push('environment variable `LAUNCHNOTES_API_KEY` is required.  Please create a management key and pass it as an environment variable when calling semantic release');
  }

  if (publish && !isBoolean(publish)) {
    errors.push('`publish` must be a boolean');
  }

  if (notifySubscribers && !isBoolean(notifySubscribers)) {
    errors.push('`notifySubscribers` must be a boolean');
  }

  if (scopeCategoryMap) {
    if (isPlainObject(scopeCategoryMap)) {
      if (!Object.keys(scopeCategoryMap).every(isString) || !Object.values(scopeCategoryMap).every(isString)) {
        errors.push('you must provide a valid Record<string, string> object to `scopeCategoryMap`');
      }
      // @TODO: Verify the category slugs are legit on the server
    } else {
      errors.push('`scopeCategoryMap` must be a plain object with string key value pairs');
    }
  }

  if (defaultCategories) {
    if (isArray(defaultCategories) && !defaultCategories.every(isString)) {
      errors.push('you must provide a valid array of strings to `defaultCategories`');
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  } else {
    log('LaunchNotes configured correctly!');
  }
}

module.exports = verifyConditions;