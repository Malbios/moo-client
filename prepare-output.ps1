mkdir ./dist/lib | Out-Null
Copy-Item -Recurse ./dist/src/* ./dist/lib | Out-Null
Remove-Item -Recurse ./dist/src | Out-Null
Copy-Item ./package.json ./dist | Out-Null
Copy-Item ./README.md ./dist | Out-Null
Copy-Item ./LICENSE ./dist | Out-Null