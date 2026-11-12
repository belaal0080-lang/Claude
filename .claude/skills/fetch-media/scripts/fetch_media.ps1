# Wrapper script for fetch-media skill (Windows PowerShell)
# This ensures the Python script runs correctly regardless of current working directory

# Get the directory where this script is located (absolute path)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillDir = Split-Path -Parent $ScriptDir

# Set up environment
$env:PYTHONPATH = "$ScriptDir;$env:PYTHONPATH"

# Load .env file if it exists
$EnvFile = Join-Path $SkillDir ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove surrounding quotes if present
            $value = $value -replace '^["'']|["'']$', ''
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Run the Python script with absolute path
$PythonScript = Join-Path $ScriptDir "search_media.py"
python $PythonScript @args
