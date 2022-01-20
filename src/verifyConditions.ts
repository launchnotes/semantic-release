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

  if (!isString(pluginConfig.projectId)) {
    errors.push('LaunchNotes `projectId` is required');
  }

  if (!isString(env.LAUNCHNOTES_API_KEY)) {
    errors.push('environment variable `LAUNCHNOTES_API_KEY` is required.  Please create a management key and pass it as an environment variable when calling semantic release');
  }

  if (pluginConfig.publish && !isBoolean(pluginConfig.publish)) {
    errors.push('`publish` must be a boolean');
  }

  if (pluginConfig.notifySubscribers && !isBoolean(pluginConfig.notifySubscribers)) {
    errors.push('`notifySubscribers` must be a boolean');
  }

  if (pluginConfig.scopeCategoryMap) {
    /**
     * We are expecting a valid Record<string, string> object
     * eg.
     * {
     *   'scope': 'category',
     * }
     */
    if (isPlainObject(pluginConfig.scopeCategoryMap)) {
      if (!Object.keys(pluginConfig.scopeCategoryMap).every(isString) || !Object.values(pluginConfig.scopeCategoryMap).every(isString)) {
        errors.push('you must provide a valid Record<string, string> object to `scopeCategoryMap`');
      }
      // @TODO: Verify the category slugs are legit on the server
    } else {
      errors.push('`scopeCategoryMap` must be a plain object with string key value pairs');
    }
  }

  if (pluginConfig.defaultCategories) {
    if (isArray(pluginConfig.defaultCategories) && !pluginConfig.defaultCategories.every(isString)) {
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