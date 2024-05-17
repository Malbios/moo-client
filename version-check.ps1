$onlineVersion = (npm view moo-client-ts version)
$localVersion = (npm pkg get version)

$localVersion = $localVersion -replace "`"", ""

$onlineVersion = [System.Version]$onlineVersion
$localVersion = [System.Version]$localVersion

if ($localVersion -le $onlineVersion) {
    throw "local version '$($localVersion)' is not higher than online version '$($onlineVersion)'"
}