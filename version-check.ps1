git config user.name "github-actions"
git config user.email "github-actions@github.com"

git fetch
git checkout dev
git pull

$onlineVersion = (npm view moo-client-ts version)
$localVersion = (npm pkg get version)

$localVersion = $localVersion -replace "`"", ""

$onlineVersion = [System.Version]$onlineVersion
$localVersion = [System.Version]$localVersion

Write-Host "Online Version: $($onlineVersion)"
Write-Host "Local Version: $($localVersion)"

if ($localVersion -le $onlineVersion) {
    # throw "local version '$($localVersion)' is not higher than online version '$($onlineVersion)'"
    npm version minor
    git push --tags origin HEAD:dev
}