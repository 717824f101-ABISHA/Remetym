@echo off
set ERROR_CODE=0
set MAVEN_BASEDIR=%~dp0
if "%MAVEN_BASEDIR:~-1%"=="\" set MAVEN_BASEDIR=%MAVEN_BASEDIR:~0,-1%

if defined JAVA_HOME goto findJavaFromJavaHome
set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto init

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
goto error

:findJavaFromJavaHome
set JAVA_EXE="%JAVA_HOME%\bin\java.exe"
if exist %JAVA_EXE% goto init

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
goto error

:init
set WRAPPER_JAR=%MAVEN_BASEDIR%\.mvn\wrapper\maven-wrapper.jar
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

%JAVA_EXE% "-Dmaven.multiModuleProjectDirectory=%MAVEN_BASEDIR%" -classpath "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
if ERRORLEVEL 1 goto error

goto end

:error
set ERROR_CODE=1

:end
cmd /C exit /B %ERROR_CODE%
