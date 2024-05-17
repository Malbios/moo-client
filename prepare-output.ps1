mkdir ./dist/lib | Out-Null
Move-Item ./dist/* -Exclude lib ./dist/lib | Out-Null
Copy-Item ./package.json ./dist | Out-Null
Copy-Item ./README.md ./dist | Out-Null
Copy-Item ./LICENSE ./dist | Out-Null