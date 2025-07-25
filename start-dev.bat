@echo off
echo 🚀 Iniciando Informatik-AI Hub Interno...
echo.

echo 📊 Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo 🌐 Iniciando cliente frontend...
start "Frontend Client" cmd /k "cd client && npm run dev"

timeout /t 5 /nobreak >nul

echo 🌍 Abriendo aplicación en el navegador...
start http://localhost:3000

echo.
echo ✅ Aplicación iniciada!
echo.
echo 📊 Backend: http://localhost:5000/api
echo 🌐 Frontend: http://localhost:3000
echo.
echo 🧩 Módulos disponibles:
echo   📁 Proyectos
echo   🧠 Ideas de IA
echo   📅 Reuniones
echo   📄 Documentos
echo   📊 Indicadores
echo   👥 Colaboradores
echo   🏆 Empleado del Mes
echo   🎁 Beneficios y Convenios
echo.
echo Presiona cualquier tecla para salir...
pause >nul
