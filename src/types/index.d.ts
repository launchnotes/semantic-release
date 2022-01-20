type PluginConfiguration = {
  projectId: string,
  publish?: boolean,
  notifySubscribers?: boolean,
  headlineTemplate?: string,
  scopeCategoryMap?: Record<string, string>,
  defaultCategories?: string[],
}

type Category = {
  slug: string,
}