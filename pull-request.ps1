Import-Module PowerShellForGitHub

$pullRequest = New-GitHubPullRequest -Uri https://github.com/Malbios/moo-client-ts -Title "dev to main" -Head dev -Base main

if (!$pullRequest) {
	throw "Pull request could not be created!"
}

Write-Host "Url: $($pullRequest.url)"

gh pr merge $pullRequest.number --rebase --auto

<# 

Pull Request response

url                   : https://api.github.com/repos/Malbios/moo-client-ts/pulls/26
id                    : 1876716982
node_id               : PR_kwDOL3V4ks5v3G22
html_url              : https://github.com/Malbios/moo-client-ts/pull/26
diff_url              : https://github.com/Malbios/moo-client-ts/pull/26.diff
patch_url             : https://github.com/Malbios/moo-client-ts/pull/26.patch
issue_url             : https://api.github.com/repos/Malbios/moo-client-ts/issues/26
number                : 26
state                 : open
locked                : False
title                 : dev to main
user                  : @{login=Malbios; id=38223677; node_id=MDQ6VXNlcjM4MjIzNjc3; avatar_url=https://avatars.githubusercontent.com/u/38223677?v=4;  
                        gravatar_id=; url=https://api.github.com/users/Malbios; html_url=https://github.com/Malbios;
                        followers_url=https://api.github.com/users/Malbios/followers;
                        following_url=https://api.github.com/users/Malbios/following{/other_user};
                        gists_url=https://api.github.com/users/Malbios/gists{/gist_id};
                        starred_url=https://api.github.com/users/Malbios/starred{/owner}{/repo};
                        subscriptions_url=https://api.github.com/users/Malbios/subscriptions;
                        organizations_url=https://api.github.com/users/Malbios/orgs; repos_url=https://api.github.com/users/Malbios/repos;
                        events_url=https://api.github.com/users/Malbios/events{/privacy};
                        received_events_url=https://api.github.com/users/Malbios/received_events; type=User; site_admin=False; UserName=Malbios;      
                        UserId=38223677}
body                  : 
created_at            : 2024-05-18 11:48:04
updated_at            : 2024-05-18 11:48:04
closed_at             : 
merged_at             : 
merge_commit_sha      : 
assignee              : 
assignees             : {}
requested_reviewers   : {}
requested_teams       : {}
labels                : {}
milestone             : 
draft                 : False
commits_url           : https://api.github.com/repos/Malbios/moo-client-ts/pulls/26/commits
review_comments_url   : https://api.github.com/repos/Malbios/moo-client-ts/pulls/26/comments
review_comment_url    : https://api.github.com/repos/Malbios/moo-client-ts/pulls/comments{/number}
comments_url          : https://api.github.com/repos/Malbios/moo-client-ts/issues/26/comments
statuses_url          : https://api.github.com/repos/Malbios/moo-client-ts/statuses/6c957db42aa0776316cf65b081963950e68e0962
head                  : @{label=Malbios:dev; ref=dev; sha=6c957db42aa0776316cf65b081963950e68e0962; user=; repo=}
base                  : @{label=Malbios:main; ref=main; sha=ddf07e6928387efc63bf150251a9e3d932763a4f; user=; repo=}
_links                : @{self=; html=; issue=; comments=; review_comments=; review_comment=; commits=; statuses=}
author_association    : OWNER
auto_merge            : 
active_lock_reason    : 
merged                : False
mergeable             : 
rebaseable            : 
mergeable_state       : unknown
merged_by             : 
comments              : 0
review_comments       : 0
maintainer_can_modify : False
commits               : 1
additions             : 3
deletions             : 1
changed_files         : 1
RepositoryUrl         : https://github.com/Malbios/moo-client-ts
PullRequestId         : 1876716982
PullRequestNumber     : 26

#>