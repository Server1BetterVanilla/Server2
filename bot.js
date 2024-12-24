require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { spawn } = require('child_process');
const path = require('path');

// Configuración del bot
const TOKEN = process.env.DISCORD_TOKEN; // Token del bot en el archivo .env
const PREFIX = '!'; // Prefijo para los comandos del bot

// Inicializar el cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

let serverProcess = null;
let playitTunnel = null;

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (command === 'iniciar') {
        if (serverProcess) {
            message.reply('El servidor ya está en ejecución.');
            return;
        }

        if (args.length < 1) {
            message.reply('Por favor, proporciona la URL del túnel de Playit.gg.');
            return;
        }

        const tunnelUrl = args[0]; // URL o IP del túnel proporcionado por el usuario

        message.reply('Iniciando el servidor de Minecraft...');
        
        // Ruta al script de inicio del servidor
        const startScript = path.join(__dirname, 'servidor_minecraft/start-server.sh');
        const serverDirectory = path.join(__dirname, 'servidor_minecraft');

        try {
            // Inicia el servidor de Minecraft
            serverProcess = spawn('sh', [startScript], {
                cwd: serverDirectory,
                stdio: 'inherit',
            });

            serverProcess.on('error', (error) => {
                console.error(`[SERVER ERROR]: ${error}`);
                message.reply('Error al iniciar el servidor.');
            });

            serverProcess.on('close', (code) => {
                console.log(`Servidor cerrado con código ${code}`);
                serverProcess = null;
                playitTunnel = null;
                message.reply('El servidor se ha detenido.');
            });

            // Establecer el túnel de Playit.gg
            playitTunnel = tunnelUrl;
            message.reply(`Servidor disponible en el túnel: ${playitTunnel}`);
        } catch (error) {
            console.error(error);
            message.reply('Error al iniciar el servidor.');
        }
    }

    if (command === 'detencion46') {
        if (!serverProcess) {
            message.reply('El servidor no está en ejecución.');
            return;
        }

        message.reply('Deteniendo el servidor de Minecraft...');
        serverProcess.stdin.write('stop\n');
        serverProcess = null;
        playitTunnel = null;
    }
});

client.login('MTMxOTAyNjQ2NjIxMzU5NzI3Mw.Gx6V5g.jlgfrXEFWg4SAqSZeblSqAr3E4Ccb79zuGx8es');
