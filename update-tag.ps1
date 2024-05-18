$localVersion = (npm pkg get version)

$localVersion = $localVersion -replace '"', ''

$localVersion = [System.Version]$localVersion

$latestTagInfo = (git for-each-ref --sort=creatordate --format '%(refname) %(creatordate)' refs/tags) | Select-Object -Last 1

$latestTag = $latestTagInfo.Split(' ')[0].Split('/')[2]

$latestTagVersion = [System.Version]($latestTag.Substring(1))

if ($localVersion -ne $latestTagVersion) {
	throw "package.json version $($localVersion) does not equal latest tag version $($latestTagVersion)"
}

$latestDevCommit = git log -n 1 dev --pretty=format:"%H"
$latestTagCommit = git rev-list -n 1 $latestTag

if ($latestDevCommit -ne $latestTagCommit) {
	#Write-Host "latestDev: " $latestDevCommit
	#Write-Host "latestTag: " $latestTagCommit

	git push --delete origin $latestTag
	git tag -d $latestTag
	git tag $latestTag $latestDevCommit
	git push --tags origin HEAD:dev
}