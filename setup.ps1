# setup.ps1
# On Windows, this script sets up a new virtual environment and installs dependencies.

# Define the virtual environment directory
$venvDir = ".venv"

# Remove existing virtual environment
if (Test-Path $venvDir) {
    Write-Host "Removing existing virtual environment..."
    Remove-Item -Recurse -Force $venvDir
}

# Create a new virtual environment
Write-Host "Creating new virtual environment..."
python -m venv $venvDir

# Activate the virtual environment and install dependencies
Write-Host "Activating virtual environment..."
& "$venvDir\Scripts\Activate.ps1"

Write-Host "Upgrading pip..."
pip install --upgrade pip

Write-Host "Installing dependencies..."
pip install -r requirements.txt

Write-Host "Creating required directories..."
New-Item -ItemType Directory -Force -Path "data" | Out-Null

Write-Host "Setup complete! To activate the virtual environment, use:"