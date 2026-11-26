# Aether

Launcher para **Minecraft Bedrock (Windows)**. Abre tu Minecraft original, gestiona perfiles y packs, y guarda tu configuración de módulos visuales.

- Solo funciona con el juego original instalado (Microsoft Store / Xbox App).
- Código abierto, sin ofuscar, sin conexiones a servidores propios, sin inyección.
- Los releases se compilan en GitHub Actions y publican su SHA256.
- Sin funciones de trampa (aimbot, killaura, autoclicker, etc.).

## Desarrollo
Requisitos: Node 20+, Rust, WebView2 (viene con Windows 11).
```
npm install
npx tauri icon app-icon.png   # solo la primera vez
npm run dev
npm run build
```

## Roadmap
1. Launcher, perfiles, importador de packs (esta versión)
2. Add-on oficial (Script API) con los módulos: posición, posición de muerte, FPS, keystrokes, CPS, reloj
3. Gestor de resource packs con perfiles y temas del launcher
