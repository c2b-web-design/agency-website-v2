# Film capture: one full-desktop still into the film folder, logged in its shot list.
# Usage: powershell -ExecutionPolicy Bypass -File film-snap.ps1 -Bin "01 Discussion" -Stage discussion -What "short-name" -Note "what it shows"
# Raw captures carry personal details (taskbar, paths, accounts); masking happens in the edit (README).
param(
  [Parameter(Mandatory)] [string] $Bin,
  [Parameter(Mandatory)] [string] $Stage,
  [Parameter(Mandatory)] [string] $What,
  [string] $Note = "",
  [string] $Film = "$env:USERPROFILE\Videos\C2B Films\01 Who we are button"
)
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
# DPI-aware, so a scaled display is captured at its real pixels rather than the logical size.
Add-Type -Namespace Native -Name User32 -MemberDefinition '[DllImport("user32.dll")] public static extern bool SetProcessDPIAware();'
[void][Native.User32]::SetProcessDPIAware()

$b = [System.Windows.Forms.SystemInformation]::VirtualScreen
$bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($b.Left, $b.Top, 0, 0, $bmp.Size)

$stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$name = "${stamp}_${Stage}_${What}.png"
$dir = Join-Path $Film $Bin
New-Item -ItemType Directory -Force $dir | Out-Null
$bmp.Save((Join-Path $dir $name), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# ASCII only in this file: Windows PowerShell 5.1 reads a BOM-less UTF-8 script as ANSI, and an em dash broke the parse.
$row = "| $(Get-Date -Format 'yyyy-MM-dd HH:mm') | $Bin/$name | $Stage | $Note | - |"
Add-Content -Path (Join-Path $Film "shot-list.md") -Value $row -Encoding utf8
Write-Output "$Bin/$name ($($b.Width)x$($b.Height))"
