// Aether: launcher para Minecraft Bedrock (Windows).
// Solo abre el juego ORIGINAL ya instalado. No descarga, parchea ni inyecta nada.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

const APP_ID: &str = "Microsoft.MinecraftUWP_8wekyb3d8bbwe";
const PACK_EXT: [&str; 4] = ["mcpack", "mcaddon", "mcworld", "mctemplate"];

#[cfg(windows)]
fn hide(cmd: &mut Command) -> &mut Command {
    use std::os::windows::process::CommandExt;
    cmd.creation_flags(0x0800_0000) // CREATE_NO_WINDOW
}
#[cfg(not(windows))]
fn hide(cmd: &mut Command) -> &mut Command { cmd }

/// true si Minecraft Bedrock (Microsoft Store / Xbox App) está instalado.
#[tauri::command]
fn is_installed() -> bool {
    let mut c = Command::new("powershell");
    hide(&mut c).args([
        "-NoProfile", "-Command",
        "if (Get-AppxPackage -Name Microsoft.MinecraftUWP) { 'yes' }",
    ]);
    c.output()
        .map(|o| String::from_utf8_lossy(&o.stdout).contains("yes"))
        .unwrap_or(false)
}

/// Abre Minecraft Bedrock original.
#[tauri::command]
fn launch_game() -> Result<(), String> {
    if !is_installed() {
        return Err("Minecraft Bedrock no está instalado en este equipo.".into());
    }
    Command::new("explorer.exe")
        .arg(format!("shell:AppsFolder\\{APP_ID}!App"))
        .spawn()
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// Importa un pack/mundo: Windows lo abre con Minecraft, que lo instala.
#[tauri::command]
fn import_pack(path: String) -> Result<(), String> {
    let p = std::path::Path::new(path.trim().trim_matches('"'));
    let ok = p.extension().and_then(|e| e.to_str())
        .map(|e| PACK_EXT.contains(&e.to_lowercase().as_str())).unwrap_or(false);
    if !ok { return Err("Solo se aceptan .mcpack, .mcaddon, .mcworld o .mctemplate".into()); }
    if !p.is_file() { return Err("No encuentro ese archivo.".into()); }
    Command::new("explorer.exe").arg(p).spawn().map(|_| ()).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![is_installed, launch_game, import_pack])
        .run(tauri::generate_context!())
        .expect("error al iniciar Aether");
}
