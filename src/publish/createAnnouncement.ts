import { ApiErrors, callMutation } from 'api';

type CreateAnnouncementArgs = {
  projectId: string,
  apiToken: string,
  apiEndpoint: string,
  markdown?: string,
  headline?: string,
  categories?: Category[],
  shouldNotifyPageSubscribers?: boolean,
}

type CreatedAnnouncement = {
  id: string,
  headline: string,
  privatePermalink: string,
}

type createAnnouncementResponse = {
  createAnnouncement: {
    announcement?: CreatedAnnouncement,
    errors?: ApiErrors,
  }
}

const createAnnouncement = async ({
  projectId,
  apiToken,
  apiEndpoint,
  markdown,
  headline,
  categories,
  shouldNotifyPageSubscribers,
}: CreateAnnouncementArgs): Promise<CreatedAnnouncement> => {
  const { createAnnouncement: { announcement, errors } } = await callMutation<createAnnouncementResponse>({
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
            privatePermalink
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
    apiToken,
    apiEndpoint,
  });

  if (announcement) {
    return announcement;
  } else {
    throw new Error(errors?.map(({ message }) => message).join(', '));
  }
};

export default createAnnouncement;