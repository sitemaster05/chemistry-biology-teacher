@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==================================================
echo   Тест почты для формы обратной связи сайта
echo   Отправка тестового письма на nadira.05@mail.ru
echo ==================================================
echo.
node --env-file=.env.local test-email.mjs
echo.
pause
