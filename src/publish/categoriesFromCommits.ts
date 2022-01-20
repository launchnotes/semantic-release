import { Commit } from 'semantic-release';

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

export default categoriesFromCommits;