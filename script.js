document.addEventListener('DOMContentLoaded', function () {
    const outputElement = document.getElementById('output');
    let activePromptIndex = 0;
    let currentDirectory = '~';

    const fileSystem = {
        '~': {
            type: 'directory',
            contents: ['.secret-pancake-recipe.txt', 'readme.txt', 'scripts/']
        },
        'scripts/': {
            type: 'directory',
            contents: ['passmanager.py']
        },
        'readme.txt': {
            type: 'file',
            content: `This website was inspired by the webkay website (https://webkay.robinlinus.com) and was made to raise awareness about all the data that websites can collect about you. Source code available on GitHub (https://github.com/PrintN/whoareyou).

If you haven't already try running the whoami command. Additionally, here are some effective ways to protect your digital footprint:

IP Address: Use a privacy-respecting VPN (like MullvadVPN) or the Tor Browser.
Browser Tracking: Most tracking can be prevented by disabling JavaScript in your browser settings or using an extension like NoScript (https://noscript.net/).`
        },
        '.secret-pancake-recipe.txt': {
            type: 'file',
            content: `Pancake Recipe:
Ingredients:
- 1 cup all-purpose flour
- 2 tablespoons sugar
- 1 tablespoon baking powder
- 1/2 teaspoon salt
- 1 cup milk
- 1 egg
- 2 tablespoons melted butter
- 1 teaspoon vanilla extract

Instructions:
1. In a bowl, mix the flour, sugar, baking powder, and salt.
2. In another bowl, whisk together the milk, egg, melted butter, and vanilla extract.
3. Pour the wet ingredients into the dry ingredients and stir until just combined (lumps are okay).
4. Heat a non-stick skillet over medium heat and lightly grease it.
5. Pour 1/4 cup of batter for each pancake onto the skillet.
6. Cook until bubbles form on the surface, then flip and cook until golden brown.
7. Enjoy!`
        },
        'passmanager.py': {
            type: 'file',
            content: `protected_passwords = [
    ["Facebook: 2Dj)f3HOLDg"], 
    ["Twitter: aB3!xYz@9pQ#"], 
    ["Instagram: 4tR$eF6&hJ2^"], 
    ["GeoGuessr: 1mN*oP8!qW3$"], 
    ["Spotify: 7sD#eF5@hJ9&"]
]
input_passphrase = input("What is the secret passphrase? ")

if input_passphrase == "YouWontGuessThisOne":
    print("Access Granted!")
    print("\nProtected Passwords:")
    for index, passwords in enumerate(protected_passwords):
        if passwords:
            for password in passwords:
                print(f"  - {password}")
        else:
            print(f"  - No passwords stored for entry {index + 1}.")
else:
    print("Wrong! Thought you could trick me?")`
        }
    };

    const commands = {
        'ls': (args) => {
            const dir = fileSystem[currentDirectory];
            const showAll = args.includes('-a');
            if (dir && dir.type === 'directory') {
                const contents = dir.contents;
                if (showAll) {
                    return contents.join('\n');
                } else {
                    return contents.filter(file => !file.startsWith('.')).join('\n');
                }
            } else {
                return `ls: cannot access '${currentDirectory}': No such file or directory`;
            }
        },
        'whoami': async () => {
            const ip = await getUserIP();
            const clipboardContent = await getClipboardContent();
            const browserInfo = getBrowserInfo();
            const downloadSpeed= await checkDownloadSpeed();
            
            outputElement.innerHTML += `<div>User: guest</div>`;
            outputElement.innerHTML += `<div>IP Address: ${ip}</div>`;
            outputElement.innerHTML += `<div>Download Speed: ${downloadSpeed}`
            outputElement.innerHTML += `<div>Clipboard: ${clipboardContent}</div>`;
            outputElement.innerHTML += `<div>${browserInfo}</div>`;
            addPrompt();
        },
        'clear': () => {
            outputElement.innerHTML = '';
            return '';
        },
        'help': () => {
            return `Available commands:
ls            - List contents of the current directory     [ -a: Show all files ]
whoami        - Display information about the current user
clear         - Clear the terminal
help          - Show this help message
cat [file]    - Display contents of a specified file
cd [dir]      - Change to the specified directory          [ ..: Go one back ]
matrix        - When you want to feel like a hacker        [Press any key to quit]`;
        },
        'cat': (filename) => {
            if (fileSystem[filename] && fileSystem[filename].type === 'file') {
                return fileSystem[filename].content;
            } else {
                return `cat: ${filename}: No such file`;
            }
        },
        'cd': (directory) => {
            if (directory === '..') {
                if (currentDirectory === 'scripts/') {
                    currentDirectory = '~';
                }
            } else if (directory === 'scripts/') {
                if (fileSystem['scripts/']) {
                    currentDirectory = 'scripts/';
                }
            } else if (fileSystem[directory] && fileSystem[directory].type === 'directory') {
                currentDirectory = directory;
            } else {
                return `cd: ${directory}: No such directory`;
            }
            return ' ';
        },
        'matrix': () => {
            const canvas = document.createElement('canvas');
            canvas.className = 'matrix-effect';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '1000';
            canvas.style.backgroundColor = 'black';
            document.body.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const fontSize = 20;
            const columns = Math.floor(canvas.width / fontSize);
            const drops = Array(columns).fill(0);

            const draw = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#0F0';
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < drops.length; i++) {
                    const text = characters.charAt(Math.floor(Math.random() * characters.length));
                    const x = i * fontSize;
                    const y = drops[i] * fontSize;

                    ctx.fillText(text, x, y);
                    if (y > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            };
            const interval = setInterval(draw, 50);
            const stopMatrixEffect = () => {
                clearInterval(interval);
                document.body.removeChild(canvas);
                document.removeEventListener('keydown', stopMatrixEffect);
                document.removeEventListener('click', stopMatrixEffect);
            };
            document.addEventListener('keydown', stopMatrixEffect);
            document.addEventListener('click', stopMatrixEffect);
            return ' ';
        }
    };
    
    function getUserIP() {
        return fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => data.ip)
            .catch(() => 'Unable to retrieve IP address');
    }
    
    function getClipboardContent() {
        return navigator.clipboard.readText()
            .then(text => text || 'Clipboard is empty')
            .catch(() => 'Unable to access clipboard');
    }

    async function checkDownloadSpeed() {
        const url = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg';
        const startTime = performance.now();
    
        try {
            const response = await fetch(url);
            const data = await response.blob();
            const endTime = performance.now();
    
            const fileSizeInBytes = data.size;
            const durationInSeconds = (endTime - startTime) / 1000;
    
            const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
            const speedInMbps = speedInBps / (1024 * 1024);
    
            return `${speedInMbps.toFixed(2)} Mbps`;
        } catch (error) {
            return 'Error fetching the file';
        }
    }

    function getBrowserInfo() {
        return `
Previous Page: ${document.referrer}
Tab History Length: ${window.history.length}
User Agent: ${navigator.userAgent}
Browser Name: ${navigator.appName}
Browser Version: ${navigator.appVersion}
Platform: ${navigator.platform}
Language: ${navigator.language}
Cookies Enabled: ${navigator.cookieEnabled}
Online Status: ${navigator.onLine}
Screen Width: ${window.screen.width}
Screen Height: ${window.screen.height}
Screen Orientation: ${screen.orientation ? screen.orientation.type : 'N/A'}
Max Touch Points: ${navigator.maxTouchPoints}
Color Depth: ${window.screen.colorDepth}
Time Zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
Device Memory: ${navigator.deviceMemory} GB
Hardware Concurrency: ${navigator.hardwareConcurrency} CPU cores
WebGL: ${!!document.createElement('canvas').getContext('webgl')}
Battery Level: ${navigator.getBattery}%`;
    }

    addPrompt();

    function handleCommand(input) {
        let result = '';
        const args = input.split(' ');
        const command = args[0];
        const argument = args.slice(1).join(' ');

        if (commands[command]) {
            result = commands[command](argument);
        } else {
            result = `command not found: ${input}`;
        }

        if (result) {
            outputElement.innerHTML += `<div>${result}</div>`;
        }
    }

    function addPrompt() {
        const allInputContainers = document.querySelectorAll('.input-container');
        allInputContainers.forEach((inputContainer) => {
            const input = inputContainer.querySelector('#input');
            const cursor = inputContainer.querySelector('#cursor');
            if (input) {
                input.contentEditable = "false";
            }
            if (cursor) {
                cursor.style.visibility = "hidden";
            }
        });

        const displayDirectory = currentDirectory === 'scripts/' ? '~/scripts' : currentDirectory;
        outputElement.innerHTML += `<div class="command-line" data-prompt-index="${activePromptIndex}"><span class="prompt">guest@ubuntu:${displayDirectory}$</span><span class="input-container"><span id="input" contentEditable="true"></span><span id="cursor" class="cursor"></span></span></div>`;
        outputElement.scrollTop = outputElement.scrollHeight;
        activePromptIndex++;
    }

    const newInput = outputElement.querySelector(`.command-line[data-prompt-index="${activePromptIndex - 1}"]`);
    document.body.addEventListener('click', function () {
        newInput.focus();
    });

    document.addEventListener('keydown', function (event) {
        const activePrompt = document.querySelector(`.command-line[data-prompt-index="${activePromptIndex - 1}"]`);
        const inputElement = activePrompt ? activePrompt.querySelector('#input') : null;
        const allInputs = document.querySelectorAll('.input-container #input');

        allInputs.forEach(input => {
            if (input !== inputElement) {
                input.contentEditable = "false";
            }
        });

        if (!inputElement || inputElement.contentEditable === "false") return;

        if (event.key === 'Enter') {
            event.preventDefault(); 
            const input = inputElement.textContent.trim();
            if (input) {
                handleCommand(input);
            }
            inputElement.textContent = "";
            addPrompt();
        }
        placeCaretAtEnd(inputElement);
    });
    function placeCaretAtEnd(el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
});