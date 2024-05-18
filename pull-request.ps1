Import-Module PowerShellForGitHub

$pullRequest = New-GitHubPullRequest -Uri https://github.com/Malbios/moo-client-ts -Title "dev to main" -Head dev -Base main

if (!$pullRequest) {
	throw "Pull request could not be created!"
}

Write-Host "Url: $($pullRequest.url)"