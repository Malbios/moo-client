function CheckVersion() {
    $onlineVersion = (npm view moo-client-ts version)
    $localVersion = (npm pkg get version)

    $localVersion = $localVersion -replace "`"", ""

    $onlineVersion = [System.Version]$onlineVersion
    $localVersion = [System.Version]$localVersion

    if ($localVersion -gt $onlineVersion) {
        return
    }

    Write-Host "Local version '$($localVersion)' is not higher than online version '$($onlineVersion)'."
    Write-Host "Updating package version..."

    npm version minor
    git push --tags origin HEAD:dev
}

function UpdateVersionTag() {
    $localVersion = (npm pkg get version)

    $localVersion = $localVersion -replace '"', ''

    $localVersion = [System.Version]$localVersion

    $latestTagInfo = (git for-each-ref --sort=creatordate --format '%(refname) %(creatordate)' refs/tags) | Select-Object -Last 1

    $latestTag = $latestTagInfo.Split(' ')[0].Split('/')[2]

    $latestTagVersion = [System.Version]($latestTag.Substring(1))

    if ($localVersion -ne $latestTagVersion) {
        throw "Somehow package.json version '$($localVersion)' does not equal latest tag version '$($latestTagVersion)'."
    }

    $latestDevCommit = git log -n 1 dev --pretty=format:"%H"
    $latestTagCommit = git rev-list -n 1 $latestTag

    if ($latestDevCommit -eq $latestTagCommit) {
        return
    }

    Write-Host "Latest version tag is not on latest commit."
    Write-Host "Moving version tag to latest commit..."

    git push --delete origin $latestTag
    git tag -d $latestTag
    git tag $latestTag $latestDevCommit
    git push --tags origin HEAD:dev
}

function Main() {
    git config user.name "github-actions"
    git config user.email "github-actions@github.com"

    git fetch
    git checkout dev
    git pull
    
    CheckVersion
    UpdateVersionTag
}

Main