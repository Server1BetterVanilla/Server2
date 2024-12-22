require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { spawn } = require('child_process');
const path = require('path');

// Configuración del bot
const TOKEN = process.env.DISCORD_TOKEN; // Token del bot en el archivo .env
const PREFIX = '!'; // Prefijo para los comandos del bot

// Inicializar el cliente de Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

let serverProcess = null;

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (command === 'iniciar') {
        if (serverProcess) {
            message.reply('El servidor ya está en ejecución.');
            return;
        }

        message.reply('Iniciando el servidor de Minecraft...');

        // Configura la ruta al script y al directorio del servidor
        const startScript = path.join(__dirname, 'servidor_minecraft/start-server.sh');
        const serverDirectory = path.join(__dirname, 'servidor_minecraft');

        // Inicia el servidor
        serverProcess = spawn('bash', [startScript], {
            cwd: serverDirectory, // Cambia el directorio de trabajo
            stdio: 'inherit', // Redirige salida para depuración
        });

        // Escucha eventos del proceso del servidor
        serverProcess.stdout?.on('data', (data) => {
            console.log(`[SERVER]: ${data}`);
        });

        serverProcess.stderr?.on('data', (data) => {
            console.error(`[SERVER ERROR]: ${data}`);
        });

        serverProcess.on('close', (code) => {
            console.log(`Servidor cerrado con código ${code}`);
            serverProcess = null;
        });
    }

    if (command === 'detencion46') {
        if (!serverProcess) {
            message.reply('El servidor no está en ejecución.');
            return;
        }

        message.reply('Deteniendo el servidor de Minecraft...');
        serverProcess.stdin.write('stop\n'); // Envía el comando 'stop' al servidor
        serverProcess = null; // Resetea la referencia al proceso
    }
});

// Inicia sesión en Discord con el token
client.login('MTMxOTAyNjQ2NjIxMzU5NzI3Mw.Gx6V5g.jlgfrXEFWg4SAqSZeblSqAr3E4Ccb79zuGx8es');
