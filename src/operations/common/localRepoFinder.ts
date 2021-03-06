import { HandlerContext } from "../../HandlerContext";
import { logger } from "../../internal/util/logger";
import { DefaultExcludes } from "../../project/fileGlobs";
import { NodeFsLocalProject } from "../../project/local/NodeFsLocalProject";
import { toPromise } from "../../project/util/projectUtils";
import { GitHubRepoRef } from "./GitHubRepoRef";
import { RepoFinder } from "./repoFinder";

/**
 * Look for repos under /org/repo format, from current working directory
 */
export function twoTierDirectoryRepoFinder(cwd: string): RepoFinder {
    return (context: HandlerContext) => {
        logger.debug(`Looking for repos in directories under '${cwd}'`);
        return NodeFsLocalProject.fromExistingDirectory(new GitHubRepoRef("owner", "sources"), cwd)
            .then(project => toPromise(project.streamFilesRaw(["*/*/"].concat(DefaultExcludes), { nodir: false })))
            .then(twoDirs => twoDirs.map(dir => {
                const path = dir.path.startsWith("/") ? dir.path.substr(1) : dir.path;
                const components = path.split("/");
                const owner = components[0];
                const repo = components[1];
                const baseDir = cwd + "/" + owner + "/" + repo;
                return { owner, repo, sha: "master", baseDir };
            }));
    };
}
