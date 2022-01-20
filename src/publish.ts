import { Commit, Context } from "semantic-release";
const axios = require('axios');
const API_ENDPOINT = 'http://app.launchnotes.local:8081/graphql';

type CreateAnnouncementArgs = {
  projectId: string,
  apiToken: string,
  markdown?: string,
  headline?: string,
  categories?: Category[],
  shouldNotifyPageSubscribers?: boolean,
}

const createLaunchNotesAnnouncement = async ({ 
  projectId,
  apiToken,
  markdown,
  headline,
  categories,
  shouldNotifyPageSubscribers,
}: CreateAnnouncementArgs) => {
  const options = {
    method: 'POST',
    url: API_ENDPOINT,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    data: { 
      query: `
        mutation createAnnouncement(
          $projectId: ID!,
          $headline: String!,
          $markdown: String!,
          $categories: [CategoryAttributes!],
          $shouldNotifyPageSubscribers: Boolean,
        ) {
          createAnnouncement(
            input: {
              announcement: {
                projectId: $projectId,
                headline: $headline,
                contentMarkdown: $markdown,
                categories: $categories,
                shouldNotifyPageSubscribers: $shouldNotifyPageSubscribers,
              }
            }
          ) {
            announcement {
              id
              headline
            }
            errors {
              path
              message
            }
          }
        }
      `, 
      variables: { 
        projectId, 
        markdown,
        headline,
        categories,
        shouldNotifyPageSubscribers,
      }, 
      operationName: 'createAnnouncement',
    },
  };

  return axios.request(options);
}

type PublishAnnouncementArgs = {
  id: string,
  apiToken: string,
}

const publishAnnouncement = ({ id, apiToken }: PublishAnnouncementArgs) => {
  const options = {
    method: 'POST',
    url: API_ENDPOINT,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    data: { 
      query: `
        mutation publishAnnouncement(
          $id: ID!
        ) {
          publishAnnouncement(input: { announcementId: $id }) {
            announcement {
              id
              publishedAt
              publicPermalink
            }
            errors {
              path
              message
            }
          }
        }
      `, 
      variables: { id }, 
      operationName: 'publishAnnouncement',
    },
  };

  return axios.request(options);
}

const scopeRegex = /^\w+\((?<scope>.+)(,(?=scope))*\):/;
const categoriesFromCommits = (commits?: Commit[], scopeCategoryMap?: Record<string, string>): { slug: string }[] => {
  if (!commits) return [];

  const scopes = new Set<string>();

  commits.forEach(({ subject }) => {
    const match = subject.match(scopeRegex);
    if (match?.groups?.scope) {
      match.groups.scope.split(',').forEach((scope: string) => {
        if (scopeCategoryMap) {
          scopes.add(scopeCategoryMap[scope.trim()]);
        } else {
          scopes.add(scope.trim());
        }
      });
    } else {
      return [];
    }
  });

  return Array.from(scopes).map(scope => ({ slug: scope }));
};

const publish = async (pluginConfig: PluginConfiguration, context: Context) => {
  const { commits, nextRelease, env, logger } = context;

  if (!nextRelease) {
    logger.log('No release to publish.  Skipping...');
    return;
  }

  const markdown = nextRelease.notes;
  const headline = nextRelease.name;
  const projectId = pluginConfig.projectId;
  const apiToken = env.LAUNCHNOTES_API_KEY;
  let categories = categoriesFromCommits(commits, pluginConfig.scopeCategoryMap);
  if (pluginConfig.defaultCategories) {
    categories = [...categories, ...pluginConfig.defaultCategories.map(slug => ({ slug }))];
  }

  const newAnnouncementResponse = await createLaunchNotesAnnouncement({ 
    projectId, 
    apiToken, 
    headline, 
    markdown, 
    categories,
    shouldNotifyPageSubscribers: pluginConfig.publish && pluginConfig.notifySubscribers,
  });
  const newAnnouncementMutationResult = newAnnouncementResponse?.data?.data?.createAnnouncement;
  const newAnnouncement = newAnnouncementMutationResult?.announcement;
  const newAnnouncementErrors = newAnnouncementMutationResult?.errors;

  if (newAnnouncement) {
    logger.log('LaunchNotes Announcement `%s` Created: %s', 
      newAnnouncement.headline, 
      newAnnouncement.privatePermalink,
    );

    // We only want to publish, if the configuration is set
    if (!pluginConfig.publish) return;

    const publishedAnnouncementResponse = await publishAnnouncement({ id: newAnnouncement.id, apiToken });
    const publishedMutationResult = publishedAnnouncementResponse?.data?.data?.publishAnnouncement;
    const publishedAnnouncement = publishedMutationResult?.announcement;
    const publishErrors = publishedMutationResult?.errors;

    if (publishedAnnouncement) {
      logger.log('LaunchNotes Announcement published at: %s to: %s', publishedAnnouncement.publishedAt, publishedAnnouncement.publicPermalink);
    } else {
      logger.error('Could not publish your LaunchNotes announcement. Error: %j', publishErrors);
    }
  } else {
    logger.error('There was an error creating your announcement: %j', newAnnouncementErrors);
  }
}

module.exports = publish;