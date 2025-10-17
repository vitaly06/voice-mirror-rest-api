# PowerShell script to install FFmpeg on Windows

Write-Host "Checking FFmpeg installation..." -ForegroundColor Yellow

# Check if FFmpeg is already available
try {
    $ffmpegVersion = ffmpeg -version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "FFmpeg is already installed!" -ForegroundColor Green
        ffmpeg -version | Select-String "ffmpeg version"
        exit 0
    }
} catch {
    Write-Host "FFmpeg not found, proceeding with installation..." -ForegroundColor Yellow
}

# Check if Chocolatey is available
try {
    choco --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Installing FFmpeg via Chocolatey..." -ForegroundColor Green
        choco install ffmpeg -y
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation
        try {
            ffmpeg -version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "FFmpeg successfully installed via Chocolatey!" -ForegroundColor Green
                exit 0
            }
        } catch {
            Write-Host "FFmpeg installation verification failed" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Chocolatey not found, trying manual installation..." -ForegroundColor Yellow
}

# Manual installation if Chocolatey is not available
Write-Host "Downloading FFmpeg manually..." -ForegroundColor Yellow

$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$downloadPath = "$env:TEMP\ffmpeg.zip"
$extractPath = "C:\ffmpeg"

try {
    # Download FFmpeg
    Write-Host "Downloading from $ffmpegUrl..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $ffmpegUrl -OutFile $downloadPath -UseBasicParsing
    
    # Extract
    Write-Host "Extracting to $extractPath..." -ForegroundColor Yellow
    if (Test-Path $extractPath) {
        Remove-Item $extractPath -Recurse -Force
    }
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    
    # Find the bin directory
    $binPath = Get-ChildItem -Path $extractPath -Recurse -Directory -Name "bin" | Select-Object -First 1
    if ($binPath) {
        $fullBinPath = Join-Path $extractPath $binPath
        
        # Add to system PATH
        Write-Host "Adding to system PATH: $fullBinPath" -ForegroundColor Yellow
        $currentPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
        
        if ($currentPath -notlike "*$fullBinPath*") {
            $newPath = $currentPath + ";" + $fullBinPath
            [System.Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
            
            # Update current session PATH
            $env:Path += ";" + $fullBinPath
        }
        
        # Verify installation
        try {
            & "$fullBinPath\ffmpeg.exe" -version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "FFmpeg successfully installed manually!" -ForegroundColor Green
                Write-Host "Location: $fullBinPath" -ForegroundColor Green
                Write-Host "Please restart your terminal/IDE to use FFmpeg in new sessions." -ForegroundColor Yellow
            } else {
                throw "FFmpeg verification failed"
            }
        } catch {
            Write-Host "Error: FFmpeg installation verification failed" -ForegroundColor Red
            Write-Host "Please restart your terminal and try running: ffmpeg -version" -ForegroundColor Yellow
        }
    } else {
        throw "Could not find bin directory in extracted files"
    }
    
    # Cleanup
    Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error during manual installation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please try installing FFmpeg manually:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://ffmpeg.org/download.html" -ForegroundColor White
    Write-Host "2. Extract to C:\ffmpeg" -ForegroundColor White
    Write-Host "3. Add C:\ffmpeg\bin to your PATH environment variable" -ForegroundColor White
    exit 1
}