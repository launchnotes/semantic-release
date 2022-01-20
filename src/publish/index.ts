import { Context } from 'semantic-release';
import createAnnouncement from './createAnnouncement';
import publishAnnouncement from './publishAnnouncement';
import categoriesFromCommits from './categoriesFromCommits';

// noinspection JSUnusedLocalSymbols
const PRODUCTION_LAUNCHNOTES_API = 'https://app.launchnotes.io/graphql';
const DEVELOPMENT_LAUNCHNOTES_API = 'http://app.launchnptes.local:8081/graphql';
const apiEndpoint = DEVELOPMENT_LAUNCHNOTES_API;

const publish = async (pluginConfig: PluginConfiguration, context: Context) => {
  const {
    commits,
    nextRelease,
    env,
    logger,
  } = context;

  const {
    scopeCategoryMap,
    defaultCategories,
    projectId,
    publish,
    notifySubscribers,
  } = pluginConfig;

  const apiToken = env.LAUNCHNOTES_API_KEY;

  if (!nextRelease) {
    logger.log('No release to publish.  Skipping...');
    return;
  }

  let categories = categoriesFromCommits(commits, scopeCategoryMap);
  if (defaultCategories) {
    categories = [...categories, ...defaultCategories.map(slug => ({ slug }))];
  }

  try {
    const { id, headline, privatePermalink } = await createAnnouncement({
      projectId,
      apiToken,
      apiEndpoint,
      headline: nextRelease.name,
      markdown: nextRelease.notes,
      categories,
      shouldNotifyPageSubscribers: publish && notifySubscribers,
    });

    logger.log('LaunchNotes Announcement `%s` Created: %s', headline, privatePermalink);

    if (!publish) return;

    const { publicPermalink, publishedAt } = await publishAnnouncement({ id, apiToken, apiEndpoint });
    logger.log('LaunchNotes Announcement published at: %s to: %s', publishedAt, publicPermalink);
  } catch (error) {
    logger.error('There was an error with your announcement:', error);
  }
}

module.exports = publish;