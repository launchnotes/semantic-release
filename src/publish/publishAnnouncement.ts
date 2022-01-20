import { ApiErrors, callMutation } from 'api';

type PublishAnnouncementArgs = {
  id: string,
  apiToken: string,
  apiEndpoint: string,
}

type PublishedAnnouncement = {
  id: string,
  publishedAt: string,
  publicPermalink?: string,
}

type PublishAnnouncementResponse = {
  publishAnnouncement: {
    announcement?: PublishedAnnouncement,
    errors?: ApiErrors,
  }
}

const publishAnnouncement = async ({
  id,
  apiToken,
  apiEndpoint,
}: PublishAnnouncementArgs): Promise<PublishedAnnouncement> => {
  const { publishAnnouncement: { announcement, errors }} = await callMutation<PublishAnnouncementResponse>({
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
    apiToken,
    apiEndpoint,
  });

  if (announcement) {
    return announcement;
  } else {
    throw new Error(errors?.map(({ message }) => message).join(', '));
  }
};

export default publishAnnouncement;