$source = "C:\Proyectos\AndroidNetrunnerCG\public\img"
$dest = "C:\Proyectos\AndroidNetrunnerCG\card-frontend\src\assets\img"
if (-Not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force
}
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
Write-Host "Assets copied to $dest"
