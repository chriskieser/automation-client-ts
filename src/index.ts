import { Configuration } from "./configuration";
import {
    CommandHandler,
    EventHandler,
    MappedParameter,
    Parameter,
    Secret,
    Tags,
} from "./decorators";
import { HandleCommand } from "./HandleCommand";
import {
    EventFired,
    HandleEvent,
} from "./HandleEvent";
import { HandlerContext } from "./HandlerContext";
import {
    Failure,
    failure,
    HandlerResult,
    RedirectResult,
    success,
    Success,
    SuccessPromise,
} from "./HandlerResult";
import { toStringArray } from "./internal/util/string";

export {
    HandlerResult,
    HandlerContext,
    HandleCommand,
    HandleEvent,
    EventFired,
    Success,
    success,
    Failure,
    failure,
    RedirectResult,
    SuccessPromise,
};

export {
    EventHandler,
    Parameter,
    CommandHandler,
    MappedParameter,
    Secret,
    Tags,
};

export {
    Configuration,
};

export abstract class MappedParameters {
    public static readonly GitHubOwner: string = "atomist://github/repository/owner";
    public static readonly GitHubRepository: string = "atomist://github/repository";
    public static readonly GitHubWebHookUrl: string = "atomist://github_webhook_url";
    public static readonly GitHubUrl: string = "atomist://github_url";
    public static readonly GitHubApiUrl: string = "atomist://github_api_url";
    public static readonly GitHubDefaultRepositoryVisibility: string = "atomist://github/default_repo_visibility";

    public static readonly SlackChannel: string = "atomist://slack/channel";
    public static readonly SlackChannelName: string = "atomist://slack/channel_name";
    public static readonly SlackTeam: string = "atomist://slack/team";
    public static readonly SlackUser: string = "atomist://slack/user";
    public static readonly SlackUserName: string = "atomist://slack/user_name";
}

export abstract class Secrets {
    public static readonly OrgToken: string = "github://org_token";
    public static readonly UserToken: string = "github://user_token";

    public static userToken(scopes: string | string[]): string {
        scopes = toStringArray(scopes);
        if (scopes && scopes.length > 0) {
            return `${this.UserToken}?scopes=${scopes.join(",")}`;
        } else {
            return this.UserToken;
        }
    }
}
