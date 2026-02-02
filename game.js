// ============================================
// SOUL COMMANDER - CORE GAME ENGINE
// Version: 1.0.0
// Mobile Optimized & PWA Ready
// ============================================

// Game Configuration
const CONFIG = {
    GAME_NAME: "Soul Commander",
    VERSION: "1.0.0",
    AUTHOR: "Soul Commander Team",
    
    // Game Settings
    MAX_HEALTH: 100,
    MAX_MANA: 50,
    MAX_ARMOR: 100,
    XP_MULTIPLIER: 1.5,
    
    // Colors (matching CSS variables)
    COLORS: {
        PRIMARY: "#6C5CE7",
        SECONDARY: "#00CEC9",
        ACCENT_RED: "#FF7675",
        ACCENT_BLUE: "#74B9FF",
        ACCENT_YELLOW: "#FFEAA7",
        ACCENT_GREEN: "#55EFC4"
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        SAVE_DATA: "soul_commander_save",
        SETTINGS: "soul_commander_settings",
        STATISTICS: "soul_commander_stats"
    }
};

// Game State
class SoulCommanderGame {
    constructor() {
        this.initializeGameState();
        this.gameRunning = false;
        this.startTime = null;
        this.playTime = 0;
        this.gameDay = 1;
        this.streak = 0;
        this.lastPlayDate = null;
        
        // Command history
        this.commandHistory = [];
        this.historyIndex = -1;
        
        // Settings
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            autoSave: true,
            notifications: true,
            vibration: true,
            theme: 'dark'
        };
        
        // Initialize
        this.loadSettings();
        this.initEventListeners();
    }
    
    initializeGameState() {
        this.player = {
            // Basic Info
            name: "Knight",
            class: "Warrior",
            level: 1,
            xp: 0,
            xpToNext: 100,
            
            // Stats
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            armor: 100,
            maxArmor: 100,
            
            // Resources
            gold: 1250,
            soulShards: 0,
            kills: 0,
            
            // Location
            location: "Sanctuary",
            area: "Town Square",
            
            // Equipment
            equipment: {
                weapon: {
                    name: "Iron Sword",
                    icon: "⚔️",
                    damage: "15-25",
                    type: "sword",
                    rarity: "common",
                    value: 100
                },
                skill: {
                    name: "Soul Slam",
                    icon: "💥",
                    damage: "20-35",
                    type: "skill",
                    manaCost: 15,
                    cooldown: 3
                },
                armor: {
                    name: "Leather Armor",
                    icon: "🛡️",
                    defense: 12,
                    type: "armor",
                    rarity: "common",
                    value: 150
                },
                accessory: {
                    name: "Crystal Shard",
                    icon: "💎",
                    effect: "+5% Critical Chance",
                    type: "accessory",
                    rarity: "uncommon",
                    value: 200
                },
                potion: {
                    name: "Health Elixir",
                    icon: "🧪",
                    heal: 30,
                    count: 3,
                    type: "consumable",
                    value: 50
                },
                special: {
                    name: "Dragon Companion",
                    icon: "🐉",
                    effect: "+10% XP Gain",
                    type: "companion",
                    rarity: "rare",
                    value: 500
                }
            },
            
            // Inventory
            inventory: [
                { name: "Health Potion", count: 3, type: "consumable" },
                { name: "Mana Potion", count: 2, type: "consumable" },
                { name: "Bronze Dagger", count: 1, type: "weapon" }
            ],
            
            // Quests
            activeQuest: {
                id: "initiate_trial",
                name: "Initiate's Trial",
                description: "Defeat 3 enemies to prove your worth",
                type: "combat",
                target: "enemy",
                required: 3,
                progress: 0,
                completed: false,
                reward: { xp: 100, gold: 50, item: "Iron Sword" }
            },
            
            // Stats
            stats: {
                totalDamage: 0,
                totalHealed: 0,
                enemiesDefeated: 0,
                questsCompleted: 0,
                goldEarned: 0,
                playTime: 0,
                daysPlayed: 1
            }
        };
        
        // Enemies Database
        this.enemies = [
            {
                id: "goblin",
                name: "Goblin",
                level: 1,
                health: 50,
                maxHealth: 50,
                damage: "8-15",
                xp: 25,
                gold: 10,
                lootChance: 0.3,
                description: "A small green creature with sharp teeth"
            },
            {
                id: "skeleton",
                name: "Skeleton",
                level: 2,
                health: 75,
                maxHealth: 75,
                damage: "12-20",
                xp: 35,
                gold: 15,
                lootChance: 0.4,
                description: "Animated bones armed with a rusty sword"
            },
            {
                id: "orc",
                name: "Orc",
                level: 3,
                health: 100,
                maxHealth: 100,
                damage: "15-25",
                xp: 50,
                gold: 25,
                lootChance: 0.5,
                description: "A brutish warrior with massive strength"
            },
            {
                id: "dragon_whelp",
                name: "Dragon Whelp",
                level: 5,
                health: 150,
                maxHealth: 150,
                damage: "20-35",
                xp: 100,
                gold: 50,
                lootChance: 0.7,
                description: "A young dragon learning to breathe fire"
            }
        ];
        
        // Locations Database
        this.locations = [
            {
                id: "sanctuary",
                name: "Sanctuary",
                areas: ["Town Square", "Training Grounds", "Marketplace", "Temple"],
                danger: 0,
                description: "A safe haven for adventurers"
            },
            {
                id: "dark_forest",
                name: "Dark Forest",
                areas: ["Ancient Woods", "Shadow Grove", "Whispering Pines", "Spider Nest"],
                danger: 1,
                description: "A mysterious forest filled with danger"
            },
            {
                id: "crystal_caves",
                name: "Crystal Caves",
                areas: ["Glowing Cavern", "Gemstone Tunnel", "Deep Chasm", "Dragon's Lair"],
                danger: 2,
                description: "Caves filled with glowing crystals and treasures"
            },
            {
                id: "ancient_ruins",
                name: "Ancient Ruins",
                areas: ["Crumbled Temple", "Forgotten Library", "Sunken Plaza", "Throne Room"],
                danger: 3,
                description: "Remains of an ancient civilization"
            }
        ];
        
        // Shop Items
        this.shopItems = [
            { id: 1, name: "Health Potion", price: 50, type: "consumable", effect: "Restores 30 HP" },
            { id: 2, name: "Mana Potion", price: 75, type: "consumable", effect: "Restores 20 MP" },
            { id: 3, name: "Iron Sword", price: 200, type: "weapon", damage: "15-25", rarity: "common" },
            { id: 4, name: "Steel Armor", price: 300, type: "armor", defense: 20, rarity: "uncommon" },
            { id: 5, name: "Magic Ring", price: 500, type: "accessory", effect: "+10% Mana", rarity: "rare" }
        ];
        
        // Commands Database
        this.commands = {
            combat: ["fight", "attack", "battle", "kill", "assault", "strike"],
            explore: ["explore", "travel", "venture", "journey", "wander"],
            heal: ["heal", "potion", "rest", "recover", "cure"],
            inventory: ["inventory", "inv", "items", "gear", "equip"],
            stats: ["stats", "status", "info", "character", "profile"],
            quest: ["quest", "mission", "task", "objective"],
            shop: ["shop", "buy", "purchase", "store", "market"],
            help: ["help", "commands", "guide", "tutorial", "?"],
            save: ["save", "store", "backup"],
            load: ["load", "restore", "continue"],
            clear: ["clear", "cls", "clean"]
        };
    }
    
    // =============== INITIALIZATION ===============
    
    initEventListeners() {
        // Command input handling
        const commandInput = document.getElementById('commandInput');
        if (commandInput) {
            commandInput.addEventListener('input', (e) => this.handleInputChange(e));
            commandInput.addEventListener('keydown', (e) => this.handleCommandKey(e));
        }
        
        // Window events
        window.addEventListener('beforeunload', () => this.autoSaveGame());
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
        
        // Visibility change (auto-save when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.settings.autoSave) {
                this.saveGame();
            }
        });
        
        // Touch device optimizations
        if ('vibrate' in navigator && this.settings.vibration) {
            // Add vibration feedback to buttons
            document.querySelectorAll('.action-btn, .equip-slot, .command-submit').forEach(btn => {
                btn.addEventListener('touchstart', () => {
                    navigator.vibrate(10); // Short vibration
                });
            });
        }
    }
    
    // =============== GAME START ===============
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.startTime = Date.now();
        this.lastPlayDate = new Date().toDateString();
        
        // Update streak
        this.checkStreak();
        
        // Initial UI update
        this.updateAllUI();
        
        // Start game loop
        this.gameLoop();
        
        // Play background music if enabled
        if (this.settings.musicEnabled) {
            this.playSound('bgMusic', 0.3, true);
        }
        
        // Welcome message
        this.addLog(`🎮 Welcome to ${CONFIG.GAME_NAME}!`, "welcome");
        this.addLog("⚔️ Your journey as a Soul Commander begins...", "system");
        this.addLog(`📍 Location: ${this.player.location} - ${this.player.area}`, "system");
        this.addLog("💡 Type 'help' to see available commands", "system");
        
        // Draw initial character
        this.drawCharacter();
        
        console.log(`${CONFIG.GAME_NAME} v${CONFIG.VERSION} started successfully!`);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // Update play time
        this.updatePlayTime();
        
        // Update character animation
        this.animateCharacter();
        
        // Auto-save every 2 minutes
        if (this.settings.autoSave && Date.now() % 120000 < 1000) {
            this.autoSaveGame();
        }
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // =============== COMMAND HANDLING ===============
    
    handleCommandKey(event) {
        const input = document.getElementById('commandInput');
        
        // Enter key - execute command
        if (event.key === 'Enter') {
            event.preventDefault();
            this.executeCommand();
            return;
        }
        
        // Arrow up - previous command
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.commandHistory.length > 0) {
                this.historyIndex = Math.max(0, this.historyIndex - 1);
                input.value = this.commandHistory[this.historyIndex] || '';
            }
            return;
        }
        
        // Arrow down - next command
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.commandHistory.length > 0) {
                this.historyIndex = Math.min(this.commandHistory.length - 1, this.historyIndex + 1);
                input.value = this.commandHistory[this.historyIndex] || '';
            }
            return;
        }
        
        // Tab key - auto-complete
        if (event.key === 'Tab') {
            event.preventDefault();
            this.autoCompleteCommand();
            return;
        }
    }
    
    handleInputChange(event) {
        const input = event.target.value.toLowerCase();
        
        // Update suggestions based on input
        this.updateSuggestions(input);
        
        // Reset history index when typing
        if (input !== this.commandHistory[this.historyIndex]) {
            this.historyIndex = -1;
        }
    }
    
    executeCommand() {
        const input = document.getElementById('commandInput');
        const command = input.value.trim();
        
        if (!command) return;
        
        // Add to history
        this.commandHistory.unshift(command);
        if (this.commandHistory.length > 20) {
            this.commandHistory.pop();
        }
        this.historyIndex = -1;
        
        // Clear input
        input.value = '';
        
        // Play sound
        this.playSound('sfxClick');
        
        // Process command
        this.processCommand(command);
    }
    
    processCommand(command) {
        // Add command to log
        this.addLog(`> ${command}`, "system");
        
        // Convert to lowercase and split
        const cmdLower = command.toLowerCase();
        const parts = cmdLower.split(' ');
        const action = parts[0];
        const args = parts.slice(1);
        
        // Check command categories
        if (this.commands.combat.includes(action)) {
            this.handleCombat(args);
        } else if (this.commands.explore.includes(action)) {
            this.handleExplore(args);
        } else if (this.commands.heal.includes(action)) {
            this.handleHeal(args);
        } else if (this.commands.inventory.includes(action)) {
            this.showInventory();
        } else if (this.commands.stats.includes(action)) {
            this.showPlayerStats();
        } else if (this.commands.quest.includes(action)) {
            this.showQuestInfo();
        } else if (this.commands.shop.includes(action)) {
            this.openShop();
        } else if (this.commands.help.includes(action)) {
            this.showHelp();
        } else if (this.commands.save.includes(action)) {
            this.saveGame();
        } else if (this.commands.load.includes(action)) {
            this.loadGame();
        } else if (this.commands.clear.includes(action)) {
            this.clearGameLog();
        } else if (action === 'rest' || action === 'sleep') {
            this.rest();
        } else if (action === 'use') {
            this.useItem(args);
        } else if (action === 'equip') {
            this.equipItem(args);
        } else {
            this.addLog(`❓ Unknown command: "${action}"`, "system");
            this.addLog("💡 Type 'help' to see available commands", "system");
        }
    }
    
    autoCompleteCommand() {
        const input = document.getElementById('commandInput');
        const current = input.value.toLowerCase().trim();
        
        if (!current) return;
        
        // Find matching commands
        const allCommands = Object.values(this.commands).flat();
        const matches = allCommands.filter(cmd => cmd.startsWith(current));
        
        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            // Show suggestions
            this.addLog(`🔍 Possible commands: ${matches.join(', ')}`, "system");
        }
        
        // Focus on input
        input.focus();
        input.setSelectionRange(current.length, input.value.length);
    }
    
    updateSuggestions(input) {
        const suggestionsBox = document.getElementById('suggestionsBox');
        if (!suggestionsBox) return;
        
        // Clear current suggestions
        suggestionsBox.innerHTML = '';
        
        if (!input) {
            // Default suggestions
            const defaults = [
                { text: "⚔️ fight [enemy]", cmd: "fight goblin" },
                { text: "🌲 explore [area]", cmd: "explore forest" },
                { text: "🎒 inventory", cmd: "inventory" },
                { text: "📊 stats", cmd: "stats" },
                { text: "🛌 rest", cmd: "rest" },
                { text: "🏪 shop", cmd: "shop" }
            ];
            
            defaults.forEach(item => {
                const div = document.createElement('div');
                div.className = 'suggestion';
                div.textContent = item.text;
                div.onclick = () => this.setCommand(item.cmd);
                suggestionsBox.appendChild(div);
            });
            
            return;
        }
        
        // Filter suggestions based on input
        const allCommands = [
            { text: "⚔️ fight [enemy]", cmd: "fight ", category: "combat" },
            { text: "🌲 explore [area]", cmd: "explore ", category: "explore" },
            { text: "🧪 heal", cmd: "heal", category: "heal" },
            { text: "🎒 inventory", cmd: "inventory", category: "inventory" },
            { text: "📊 stats", cmd: "stats", category: "stats" },
            { text: "🎯 quest", cmd: "quest", category: "quest" },
            { text: "🏪 shop", cmd: "shop", category: "shop" },
            { text: "❓ help", cmd: "help", category: "help" },
            { text: "💾 save", cmd: "save", category: "save" },
            { text: "📂 load", cmd: "load", category: "load" },
            { text: "🗑️ clear", cmd: "clear", category: "clear" },
            { text: "🛌 rest", cmd: "rest", category: "rest" }
        ];
        
        const filtered = allCommands.filter(item => 
            item.text.toLowerCase().includes(input) || 
            item.cmd.toLowerCase().includes(input)
        ).slice(0, 6); // Limit to 6 suggestions
        
        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = 'suggestion';
            div.textContent = item.text;
            div.onclick = () => this.setCommand(item.cmd + (item.cmd.endsWith(' ') ? '' : ''));
            suggestionsBox.appendChild(div);
        });
    }
    
    // =============== COMBAT SYSTEM ===============
    
    handleCombat(args) {
        const enemyName = args.join(' ') || 'goblin';
        const enemy = this.findEnemy(enemyName);
        
        if (!enemy) {
            this.addLog(`❓ Enemy "${enemyName}" not found.`, "system");
            this.addLog(`💡 Available enemies: ${this.enemies.map(e => e.name).join(', ')}`, "system");
            return;
        }
        
        // Check if player has enough health
        if (this.player.health <= 0) {
            this.addLog("💀 You are too weak to fight! Heal first.", "combat");
            return;
        }
        
        // Start combat
        this.combatRound(enemy);
    }
    
    findEnemy(name) {
        return this.enemies.find(enemy => 
            enemy.name.toLowerCase().includes(name.toLowerCase()) ||
            enemy.id.toLowerCase().includes(name.toLowerCase())
        ) || this.enemies[0]; // Default to first enemy
    }
    
    combatRound(enemy) {
        this.addLog(`⚔️ You encounter a ${enemy.name}!`, "combat");
        
        // Player attack
        const playerDamage = this.calculateDamage(this.player.equipment.weapon.damage);
        const isCritical = Math.random() < 0.1; // 10% crit chance
        
        const actualPlayerDamage = isCritical ? 
            Math.floor(playerDamage * 1.5) : playerDamage;
        
        enemy.health -= actualPlayerDamage;
        
        if (isCritical) {
            this.addLog(`💥 CRITICAL HIT! You strike with ${this.player.equipment.weapon.name} for ${actualPlayerDamage} damage!`, "combat");
            this.screenShake();
        } else {
            this.addLog(`🎯 You attack with ${this.player.equipment.weapon.name} for ${actualPlayerDamage} damage`, "combat");
        }
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
            this.defeatEnemy(enemy);
            return;
        }
        
        // Enemy attack
        const enemyDamage = this.calculateDamage(enemy.damage);
        const armorReduction = Math.floor(this.player.equipment.armor.defense / 10);
        const actualEnemyDamage = Math.max(1, enemyDamage - armorReduction);
        
        this.player.health -= actualEnemyDamage;
        this.player.armor = Math.max(0, this.player.armor - 5);
        
        this.addLog(`🔥 ${enemy.name} attacks! You take ${actualEnemyDamage} damage`, "combat");
        
        if (this.player.armor > 0) {
            this.addLog(`🛡️ Armor absorbed ${armorReduction} damage`, "system");
        }
        
        // Check if player is defeated
        if (this.player.health <= 0) {
            this.playerDefeated();
            return;
        }
        
        // Update health display
        this.addLog(`❤️ Your Health: ${this.player.health}/${this.player.maxHealth}`, "combat");
        this.addLog(`💀 ${enemy.name} Health: ${enemy.health}/${enemy.maxHealth}`, "combat");
        
        // Update UI
        this.updateHealthBars();
        this.updateStatsDisplay();
        
        // Play combat sound
        this.playSound('sfxCombat');
    }
    
    calculateDamage(damageStr) {
        if (damageStr.includes('-')) {
            const [min, max] = damageStr.split('-').map(Number);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return parseInt(damageStr) || 10;
    }
    
    defeatEnemy(enemy) {
        // Calculate rewards
        const xpGain = enemy.xp;
        const goldGain = enemy.gold;
        const soulShardGain = Math.floor(Math.random() * 3) + 1;
        
        // Update player
        this.player.xp += xpGain;
        this.player.gold += goldGain;
        this.player.soulShards += soulShardGain;
        this.player.kills++;
        this.player.stats.enemiesDefeated++;
        this.player.stats.totalDamage += enemy.maxHealth;
        
        // Update quest progress
        if (this.player.activeQuest && 
            this.player.activeQuest.type === "combat" && 
            !this.player.activeQuest.completed) {
            this.player.activeQuest.progress++;
            
            if (this.player.activeQuest.progress >= this.player.activeQuest.required) {
                this.completeQuest();
            }
        }
        
        // Add log messages
        this.addLog(`🏆 ${enemy.name} defeated!`, "combat");
        this.addLog(`⭐ +${xpGain} XP`, "xp");
        this.addLog(`💰 +${goldGain} Gold`, "loot");
        this.addLog(`💎 +${soulShardGain} Soul Shards`, "loot");
        
        // Check for level up
        if (this.player.xp >= this.player.xpToNext) {
            this.levelUp();
        }
        
        // Random loot drop
        if (Math.random() < enemy.lootChance) {
            this.dropLoot(enemy);
        }
        
        // Reset enemy health for next encounter
        enemy.health = enemy.maxHealth;
        
        // Update UI
        this.updateAllUI();
        
        // Victory effect
        this.victoryEffect();
    }
    
    dropLoot(enemy) {
        const lootTable = [
            { name: "Health Potion", chance: 0.5 },
            { name: "Mana Potion", chance: 0.3 },
            { name: "Iron Dagger", chance: 0.15 },
            { name: "Magic Scroll", chance: 0.05 }
        ];
        
        const loot = lootTable.find(item => Math.random() < item.chance) || lootTable[0];
        
        // Add to inventory
        const existingItem = this.player.inventory.find(i => i.name === loot.name);
        if (existingItem) {
            existingItem.count++;
        } else {
            this.player.inventory.push({ name: loot.name, count: 1, type: "consumable" });
        }
        
        this.addLog(`🎁 Loot dropped: ${loot.name}`, "loot");
    }
    
    playerDefeated() {
        this.addLog("💀 YOU HAVE BEEN DEFEATED!", "combat");
        this.addLog("Your soul returns to the Sanctuary...", "system");
        
        // Penalty
        const goldLoss = Math.floor(this.player.gold * 0.1); // Lose 10% gold
        this.player.gold = Math.max(0, this.player.gold - goldLoss);
        
        // Reset stats
        this.player.health = Math.floor(this.player.maxHealth * 0.25);
        this.player.mana = Math.floor(this.player.maxMana * 0.25);
        this.player.armor = Math.floor(this.player.maxArmor * 0.25);
        this.player.location = "Sanctuary";
        this.player.area = "Town Square";
        
        // Update UI
        this.updateAllUI();
        
        // Defeat effect
        this.defeatEffect();
        
        this.addLog(`💰 Lost ${goldLoss} gold as penalty`, "system");
        this.addLog("💡 Rest and heal before fighting again", "system");
    }
    
    // =============== EXPLORATION SYSTEM ===============
    
    handleExplore(args) {
        const areaName = args.join(' ') || '';
        
        if (areaName) {
            // Try to explore specific area
            this.travelToArea(areaName);
        } else {
            // Random exploration
            this.randomExploration();
        }
    }
    
    randomExploration() {
        this.addLog("🌲 You begin exploring...", "system");
        
        // Consume energy
        const energyCost = 10;
        this.player.mana = Math.max(0, this.player.mana - energyCost);
        
        // Random event
        const events = [
            { type: "enemy", chance: 0.4 },
            { type: "treasure", chance: 0.3 },
            { type: "nothing", chance: 0.2 },
            { type: "special", chance: 0.1 }
        ];
        
        const event = this.weightedRandom(events);
        
        switch (event.type) {
            case "enemy":
                const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                this.addLog(`⚠️ You encountered a ${randomEnemy.name}!`, "combat");
                this.addLog(`💡 Type 'fight ${randomEnemy.name.toLowerCase()}' to attack`, "system");
                break;
                
            case "treasure":
                const treasureGold = Math.floor(Math.random() * 50) + 20;
                this.player.gold += treasureGold;
                this.addLog(`💰 Found hidden treasure! +${treasureGold} Gold`, "loot");
                break;
                
            case "special":
                this.addLog("🌟 You discover an ancient shrine!", "system");
                this.addLog("✨ Your stats feel slightly enhanced...", "heal");
                // Small stat boost
                this.player.maxHealth += 5;
                this.player.health += 5;
                break;
                
            default:
                this.addLog("You wander but find nothing of interest...", "system");
        }
        
        this.addLog(`⚡ Command Power -${energyCost}`, "system");
        
        // Update UI
        this.updateAllUI();
    }
    
    travelToArea(areaName) {
        // Find location
        const currentLocation = this.locations.find(loc => 
            loc.name.toLowerCase() === this.player.location.toLowerCase()
        );
        
        if (!currentLocation) {
            this.addLog(`❓ Cannot find location information`, "system");
            return;
        }
        
        // Check if area exists in current location
        const area = currentLocation.areas.find(a => 
            a.toLowerCase().includes(areaName.toLowerCase())
        );
        
        if (!area) {
            this.addLog(`❓ Area "${areaName}" not found in ${this.player.location}`, "system");
            this.addLog(`📍 Available areas: ${currentLocation.areas.join(', ')}`, "system");
            return;
        }
        
        // Travel cost
        const travelCost = 5;
        if (this.player.mana < travelCost) {
            this.addLog("⚡ Not enough Command Power to travel!", "system");
            return;
        }
        
        // Update location
        this.player.area = area;
        this.player.mana -= travelCost;
        
        this.addLog(`🚶 Traveling to ${area}...`, "system");
        this.addLog(`📍 Arrived at ${area}`, "system");
        this.addLog(`⚡ Command Power -${travelCost}`, "system");
        
        // Random encounter chance based on danger level
        if (Math.random() < (currentLocation.danger * 0.2)) {
            setTimeout(() => {
                const randomEnemy = this.enemies[Math.floor(Math.random() * Math.min(this.enemies.length, currentLocation.danger + 2))];
                this.addLog(`⚠️ Ambushed by a ${randomEnemy.name}!`, "combat");
                this.addLog(`💡 Type 'fight ${randomEnemy.name.toLowerCase()}' to defend yourself`, "system");
            }, 1000);
        }
        
        // Update UI
        this.updateAllUI();
    }
    
    weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.chance, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= item.chance;
            if (random <= 0) {
                return item;
            }
        }
        
        return items[0];
    }
    
    // =============== HEALING & REST SYSTEM ===============
    
    handleHeal(args) {
        if (args.length > 0 && args[0] === 'potion') {
            this.usePotion();
        } else {
            this.rest();
        }
    }
    
    usePotion() {
        const potion = this.player.equipment.potion;
        
        if (potion.count <= 0) {
            this.addLog("❌ No elixirs remaining!", "system");
            this.addLog("💡 Visit the shop to buy more", "system");
            return;
        }
        
        if (this.player.health >= this.player.maxHealth) {
            this.addLog("✅ Already at full health!", "system");
            return;
        }
        
        // Use potion
        potion.count--;
        const healAmount = potion.heal;
        const oldHealth = this.player.health;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
        const actualHeal = this.player.health - oldHealth;
        
        this.player.stats.totalHealed += actualHeal;
        
        this.addLog(`🧪 Used ${potion.name}!`, "heal");
        this.addLog(`❤️ +${actualHeal} Health`, "heal");
        this.addLog(`📦 Elixirs remaining: ${potion.count}`, "heal");
        
        // Heal effect
        this.healEffect();
        
        // Update UI
        this.updateAllUI();
    }
    
    rest() {
        if (this.player.health >= this.player.maxHealth && 
            this.player.mana >= this.player.maxMana) {
            this.addLog("✅ Already fully rested!", "system");
            return;
        }
        
        this.addLog("🛌 You take a moment to rest...", "system");
        
        // Restore stats
        const oldHealth = this.player.health;
        const oldMana = this.player.mana;
        
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 20);
        this.player.mana = Math.min(this.player.maxMana, this.player.mana + 30);
        
        const healthRestored = this.player.health - oldHealth;
        const manaRestored = this.player.mana - oldMana;
        
        if (healthRestored > 0) {
            this.addLog(`❤️ +${healthRestored} Health`, "heal");
        }
        
        if (manaRestored > 0) {
            this.addLog(`🔮 +${manaRestored} Command Power`, "heal");
        }
        
        // Advance game day if significant rest
        if (healthRestored > 10) {
            this.gameDay++;
            this.addLog(`📅 Day ${this.gameDay} begins...`, "system");
        }
        
        // Update UI
        this.updateAllUI();
        
        // Rest effect
        this.restEffect();
    }
    
    // =============== LEVEL & PROGRESSION ===============
    
    levelUp() {
        this.player.level++;
        this.player.xp -= this.player.xpToNext;
        this.player.xpToNext = Math.floor(this.player.xpToNext * CONFIG.XP_MULTIPLIER);
        
        // Stat increases
        this.player.maxHealth += 20;
        this.player.health = this.player.maxHealth;
        this.player.maxMana += 10;
        this.player.mana = this.player.maxMana;
        this.player.maxArmor += 15;
        this.player.armor = this.player.maxArmor;
        
        this.addLog(`✨ LEVEL UP! You are now Level ${this.player.level}!`, "xp");
        this.addLog(`❤️ Max Health increased to ${this.player.maxHealth}`, "heal");
        this.addLog(`🔮 Max Command Power increased to ${this.player.maxMana}`, "heal");
        this.addLog(`🛡️ Max Armor increased to ${this.player.maxArmor}`, "heal");
        
        // Level up effect
        this.levelUpEffect();
        
        // Check for multiple level ups
        if (this.player.xp >= this.player.xpToNext) {
            setTimeout(() => this.levelUp(), 1000);
        }
        
        // Update UI
        this.updateAllUI();
    }
    
    completeQuest() {
        const quest = this.player.activeQuest;
        
        if (!quest || quest.completed) return;
        
        quest.completed = true;
        this.player.stats.questsCompleted++;
        
        // Give rewards
        this.player.xp += quest.reward.xp;
        this.player.gold += quest.reward.gold;
        this.player.stats.goldEarned += quest.reward.gold;
        
        this.addLog(`🎉 Quest Completed: ${quest.name}!`, "xp");
        this.addLog(`⭐ +${quest.reward.xp} XP`, "xp");
        this.addLog(`💰 +${quest.reward.gold} Gold`, "loot");
        
        if (quest.reward.item) {
            this.addLog(`🎁 Reward: ${quest.reward.item}`, "loot");
            // Add item to inventory
            const existingItem = this.player.inventory.find(i => i.name === quest.reward.item);
            if (existingItem) {
                existingItem.count++;
            } else {
                this.player.inventory.push({ 
                    name: quest.reward.item, 
                    count: 1, 
                    type: "weapon" 
                });
            }
        }
        
        // Generate new quest
        this.generateNewQuest();
        
        // Update UI
        this.updateAllUI();
        
        // Quest complete effect
        this.questCompleteEffect();
    }
    
    generateNewQuest() {
        const questTypes = [
            {
                type: "combat",
                templates: [
                    { name: "Soul Hunter", desc: "Defeat {count} enemies", required: 5 },
                    { name: "Dragon Slayer", desc: "Slay {count} dragons", required: 3 },
                    { name: "Goblin Exterminator", desc: "Eliminate {count} goblins", required: 10 }
                ]
            },
            {
                type: "collection",
                templates: [
                    { name: "Soul Collector", desc: "Collect {count} Soul Shards", required: 15 },
                    { name: "Treasure Hunter", desc: "Gather {count} gold", required: 500 }
                ]
            },
            {
                type: "exploration",
                templates: [
                    { name: "World Explorer", desc: "Visit {count} different areas", required: 5 },
                    { name: "Dungeon Delver", desc: "Explore dangerous locations {count} times", required: 3 }
                ]
            }
        ];
        
        const randomType = questTypes[Math.floor(Math.random() * questTypes.length)];
        const template = randomType.templates[Math.floor(Math.random() * randomType.templates.length)];
        
        const rewards = {
            xp: this.player.level * 50,
            gold: this.player.level * 25,
            item: this.getRandomItemReward()
        };
        
        this.player.activeQuest = {
            id: `quest_${Date.now()}`,
            name: template.name,
            description: template.desc.replace('{count}', template.required),
            type: randomType.type,
            target: randomType.type === "combat" ? "enemy" : "item",
            required: template.required,
            progress: 0,
            completed: false,
            reward: rewards
        };
        
        this.addLog(`🎯 New Quest Available: ${this.player.activeQuest.name}`, "system");
        this.addLog(`📝 ${this.player.activeQuest.description}`, "system");
    }
    
    getRandomItemReward() {
        const items = [
            "Health Potion", "Mana Potion", "Iron Sword", 
            "Steel Armor", "Magic Ring", "Ancient Scroll"
        ];
        return items[Math.floor(Math.random() * items.length)];
    }
    
        // =============== UI UPDATE METHODS ===============
    
    updateAllUI() {
        this.updateHealthBars();
        this.updateStatsDisplay();
        this.updateEquipmentDisplay();
        this.updateQuestDisplay();
        this.updateCharacterInfo();
        
        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.autoSaveGame();
        }
    }
    
    updateHealthBars() {
        // Health
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        const healthBar = document.getElementById('healthBar');
        const healthValue = document.getElementById('healthValue');
        
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
            healthValue.textContent = `${this.player.health}/${this.player.maxHealth}`;
            
            // Update glow based on health level
            const healthGlow = document.getElementById('healthGlow');
            if (healthGlow) {
                if (healthPercent < 30) {
                    healthGlow.style.background = 'rgba(255, 118, 117, 0.5)';
                    healthGlow.style.animation = 'pulse 1s infinite';
                } else {
                    healthGlow.style.background = 'transparent';
                    healthGlow.style.animation = 'none';
                }
            }
        }
        
        // Mana
        const manaPercent = (this.player.mana / this.player.maxMana) * 100;
        const manaBar = document.getElementById('manaBar');
        const manaValue = document.getElementById('manaValue');
        
        if (manaBar) {
            manaBar.style.width = `${manaPercent}%`;
            manaValue.textContent = `${this.player.mana}/${this.player.maxMana}`;
        }
        
        // XP
        const xpPercent = (this.player.xp / this.player.xpToNext) * 100;
        const xpBar = document.getElementById('xpBar');
        const xpValue = document.getElementById('xpValue');
        
        if (xpBar) {
            xpBar.style.width = `${xpPercent}%`;
            xpValue.textContent = `${this.player.xp}/${this.player.xpToNext}`;
        }
    }
    
    updateStatsDisplay() {
        // Update quick stats
        document.getElementById('charLevel').textContent = this.player.level;
        document.getElementById('goldValue').textContent = this.player.gold.toLocaleString();
        document.getElementById('killsValue').textContent = this.player.kills;
        document.getElementById('locationValue').textContent = this.player.area;
        
        // Update game day and play time
        document.getElementById('gameDay').textContent = this.gameDay;
        document.getElementById('streak').textContent = this.streak;
    }
    
    updateEquipmentDisplay() {
        // Update equipment slots
        const equipment = this.player.equipment;
        
        document.getElementById('weaponIcon').textContent = equipment.weapon.icon;
        document.getElementById('weaponName').textContent = equipment.weapon.name;
        
        document.getElementById('skillIcon').textContent = equipment.skill.icon;
        document.getElementById('skillName').textContent = equipment.skill.name;
        
        document.getElementById('armorIcon').textContent = equipment.armor.icon;
        document.getElementById('armorName').textContent = equipment.armor.name;
        
        document.getElementById('accessoryIcon').textContent = equipment.accessory.icon;
        document.getElementById('accessoryName').textContent = equipment.accessory.name;
        
        document.getElementById('potionIcon').textContent = equipment.potion.icon;
        document.getElementById('potionName').textContent = `${equipment.potion.count}x`;
        
        document.getElementById('specialIcon').textContent = equipment.special.icon;
        document.getElementById('specialName').textContent = equipment.special.name;
    }
    
    updateQuestDisplay() {
        const quest = this.player.activeQuest;
        if (!quest) return;
        
        const questTitle = document.getElementById('questTitle');
        const questDesc = document.getElementById('questDesc');
        const questProgress = document.getElementById('questProgress');
        const questProgressText = document.getElementById('questProgressText');
        
        if (questTitle) questTitle.textContent = quest.name;
        if (questDesc) questDesc.textContent = quest.description;
        
        if (questProgress) {
            const progressPercent = (quest.progress / quest.required) * 100;
            questProgress.style.width = `${progressPercent}%`;
        }
        
        if (questProgressText) {
            questProgressText.textContent = `${quest.progress}/${quest.required}`;
        }
    }
    
    updateCharacterInfo() {
        document.getElementById('charName').textContent = this.player.name;
        document.getElementById('charClass').textContent = `${this.player.equipment.weapon.icon} ${this.player.class}`;
    }
    
    updatePlayTime() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000) + this.playTime;
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        const timeString = hours > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('playTime').textContent = timeString;
        this.player.stats.playTime = elapsed;
    }
    
    updateConnectionStatus(online) {
        const statusElement = document.getElementById('connectionStatus');
        const statusDot = document.getElementById('statusDot');
        
        if (online) {
            statusElement.textContent = "Connected";
            statusElement.style.color = CONFIG.COLORS.ACCENT_GREEN;
            statusDot.style.color = CONFIG.COLORS.ACCENT_GREEN;
            statusDot.textContent = "●";
        } else {
            statusElement.textContent = "Offline (Playing Local)";
            statusElement.style.color = CONFIG.COLORS.ACCENT_RED;
            statusDot.style.color = CONFIG.COLORS.ACCENT_RED;
            statusDot.textContent = "○";
        }
    }
    
    // =============== CHARACTER DRAWING ===============
    
    drawCharacter() {
        const canvas = document.getElementById('characterCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw character based on class and equipment
        this.drawCharacterBase(ctx);
        this.drawCharacterEquipment(ctx);
        this.drawCharacterEffects(ctx);
    }
    
    drawCharacterBase(ctx) {
        // Body (Soul Knight style)
        ctx.fillStyle = CONFIG.COLORS.PRIMARY;
        ctx.fillRect(40, 70, 48, 40); // Body
        
        // Head
        ctx.fillStyle = CONFIG.COLORS.ACCENT_YELLOW;
        ctx.fillRect(50, 40, 28, 30); // Head
        
        // Eyes
        ctx.fillStyle = '#2D3436';
        ctx.fillRect(55, 50, 6, 6); // Left eye
        ctx.fillRect(67, 50, 6, 6); // Right eye
        
        // Smile
        ctx.beginPath();
        ctx.arc(64, 60, 8, 0, Math.PI);
        ctx.strokeStyle = '#2D3436';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawCharacterEquipment(ctx) {
        const equipment = this.player.equipment;
        
        // Draw weapon
        ctx.fillStyle = '#B2BEC3';
        ctx.fillRect(20, 75, 20, 6); // Weapon handle
        ctx.fillRect(15, 70, 30, 16); // Weapon blade
        
        // Draw armor
        ctx.fillStyle = CONFIG.COLORS.SECONDARY;
        ctx.fillRect(45, 72, 38, 10); // Chest armor
        ctx.fillRect(40, 100, 48, 8); // Belt
        
        // Draw accessory glow if rare
        if (equipment.accessory.rarity === 'rare' || equipment.accessory.rarity === 'epic') {
            ctx.shadowColor = CONFIG.COLORS.ACCENT_YELLOW;
            ctx.shadowBlur = 15;
            ctx.fillStyle = CONFIG.COLORS.ACCENT_YELLOW;
            ctx.fillRect(60, 45, 8, 8);
            ctx.shadowBlur = 0;
        }
    }
    
    drawCharacterEffects(ctx) {
        // Health-based glow
        const healthPercent = this.player.health / this.player.maxHealth;
        
        if (healthPercent < 0.3) {
            // Low health - red pulse
            ctx.shadowColor = CONFIG.COLORS.ACCENT_RED;
            ctx.shadowBlur = 10 + Math.sin(Date.now() / 200) * 5;
            ctx.fillRect(40, 70, 48, 40);
        } else if (healthPercent > 0.8) {
            // High health - green glow
            ctx.shadowColor = CONFIG.COLORS.ACCENT_GREEN;
            ctx.shadowBlur = 5;
            ctx.fillRect(40, 70, 48, 40);
        }
        
        ctx.shadowBlur = 0;
    }
    
    animateCharacter() {
        // Simple idle animation
        const canvas = document.getElementById('characterCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const time = Date.now() / 1000;
        
        // Gentle floating animation
        const floatOffset = Math.sin(time) * 2;
        
        // Redraw character with animation
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(0, floatOffset);
        this.drawCharacter();
        ctx.restore();
    }
    
    // =============== VISUAL EFFECTS ===============
    
    screenShake() {
        const container = document.querySelector('.game-container');
        if (!container) return;
        
        container.style.animation = 'shake 0.5s';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);
    }
    
    victoryEffect() {
        // Add victory particles
        this.createParticles(CONFIG.COLORS.ACCENT_YELLOW, 10);
        
        // Play victory sound if available
        this.playSound('victory');
    }
    
    defeatEffect() {
        // Red screen flash
        const container = document.querySelector('.game-container');
        if (container) {
            container.style.boxShadow = `0 0 30px ${CONFIG.COLORS.ACCENT_RED}`;
            setTimeout(() => {
                container.style.boxShadow = '';
            }, 1000);
        }
    }
    
    healEffect() {
        // Green healing glow
        const healthBar = document.getElementById('healthBar');
        if (healthBar) {
            healthBar.style.boxShadow = `0 0 20px ${CONFIG.COLORS.ACCENT_GREEN}`;
            setTimeout(() => {
                healthBar.style.boxShadow = '';
            }, 1000);
        }
        
        // Create healing particles
        this.createParticles(CONFIG.COLORS.ACCENT_GREEN, 5);
    }
    
    levelUpEffect() {
        // Create level up particles
        this.createParticles(CONFIG.COLORS.PRIMARY, 15);
        
        // Screen flash
        const container = document.querySelector('.game-container');
        if (container) {
            const originalBoxShadow = container.style.boxShadow;
            container.style.boxShadow = `0 0 50px ${CONFIG.COLORS.PRIMARY}`;
            setTimeout(() => {
                container.style.boxShadow = originalBoxShadow;
            }, 1000);
        }
    }
    
    questCompleteEffect() {
        // Create golden particles
        this.createParticles('#FFD700', 8);
    }
    
    restEffect() {
        // Blue mana particles
        this.createParticles(CONFIG.COLORS.ACCENT_BLUE, 6);
    }
    
    createParticles(color, count) {
        // Simple particle effect for mobile performance
        const container = document.querySelector('.game-container');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat 1s ease-out forwards;
            `;
            
            // Add to container
            container.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
        
        // Add particle animation to style if not exists
        if (!document.getElementById('particle-animations')) {
            const style = document.createElement('style');
            style.id = 'particle-animations';
            style.textContent = `
                @keyframes particleFloat {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${Math.random() * 100 - 50}px, -100px) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // =============== INVENTORY & SHOP ===============
    
    showInventory() {
        this.addLog("🎒 === INVENTORY ===", "system");
        this.addLog("⚔️ Equipped Items:", "system");
        
        // Show equipped items
        Object.entries(this.player.equipment).forEach(([slot, item]) => {
            this.addLog(`${item.icon} ${slot.toUpperCase()}: ${item.name}`, "system");
        });
        
        this.addLog("📦 Inventory Items:", "system");
        
        if (this.player.inventory.length === 0) {
            this.addLog("Empty", "system");
        } else {
            this.player.inventory.forEach(item => {
                this.addLog(`${item.name} x${item.count}`, "system");
            });
        }
        
        this.addLog("💡 Use 'use [item]' or 'equip [item]' commands", "system");
    }
    
    useItem(args) {
        if (args.length === 0) {
            this.addLog("❓ Usage: use [item name]", "system");
            this.addLog("💡 Example: use 'Health Potion'", "system");
            return;
        }
        
        const itemName = args.join(' ').toLowerCase();
        const item = this.player.inventory.find(i => 
            i.name.toLowerCase().includes(itemName)
        );
        
        if (!item) {
            this.addLog(`❓ Item "${args.join(' ')}" not found in inventory`, "system");
            return;
        }
        
        // Handle different item types
        switch(item.type) {
            case 'consumable':
                this.useConsumable(item);
                break;
            case 'weapon':
                this.equipWeapon(item);
                break;
            default:
                this.addLog(`📦 Used ${item.name}`, "system");
                // Remove from inventory
                item.count--;
                if (item.count <= 0) {
                    const index = this.player.inventory.indexOf(item);
                    this.player.inventory.splice(index, 1);
                }
        }
        
        this.updateAllUI();
    }
    
    useConsumable(item) {
        if (item.name.toLowerCase().includes('potion')) {
            if (item.name.toLowerCase().includes('health')) {
                // Health potion
                const healAmount = 30;
                const oldHealth = this.player.health;
                this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
                const actualHeal = this.player.health - oldHealth;
                
                this.addLog(`🧪 Used ${item.name}!`, "heal");
                this.addLog(`❤️ +${actualHeal} Health`, "heal");
                
                this.healEffect();
            } else if (item.name.toLowerCase().includes('mana')) {
                // Mana potion
                const manaAmount = 20;
                const oldMana = this.player.mana;
                this.player.mana = Math.min(this.player.maxMana, this.player.mana + manaAmount);
                const actualMana = this.player.mana - oldMana;
                
                this.addLog(`🔮 Used ${item.name}!`, "heal");
                this.addLog(`⚡ +${actualMana} Command Power`, "heal");
            }
            
            // Remove from inventory
            item.count--;
            if (item.count <= 0) {
                const index = this.player.inventory.indexOf(item);
                this.player.inventory.splice(index, 1);
            }
        }
    }
    
    equipWeapon(item) {
        // Store old weapon
        const oldWeapon = this.player.equipment.weapon;
        
        // Equip new weapon
        this.player.equipment.weapon = {
            name: item.name,
            icon: "⚔️",
            damage: "20-30", // Default damage for weapons
            type: "weapon",
            rarity: "common",
            value: 150
        };
        
        this.addLog(`⚔️ Equipped ${item.name}!`, "system");
        
        // Add old weapon to inventory
        const existingItem = this.player.inventory.find(i => i.name === oldWeapon.name);
        if (existingItem) {
            existingItem.count++;
        } else {
            this.player.inventory.push({
                name: oldWeapon.name,
                count: 1,
                type: "weapon"
            });
        }
        
        // Remove equipped item from inventory
        item.count--;
        if (item.count <= 0) {
            const index = this.player.inventory.indexOf(item);
            this.player.inventory.splice(index, 1);
        }
    }
    
    equipItem(args) {
        // Similar to useItem but specifically for equipment
        this.useItem(args);
    }
    
    openShop() {
        this.addLog("🏪 === SOUL MARKET ===", "system");
        this.addLog("💰 Your Gold: " + this.player.gold, "system");
        this.addLog("Available Items:", "system");
        
        this.shopItems.forEach((item, index) => {
            this.addLog(`${index + 1}. ${item.name} - ${item.price} gold`, "system");
            if (item.effect) {
                this.addLog(`   Effect: ${item.effect}`, "system");
            }
        });
        
        this.addLog("💡 Use 'buy [number]' to purchase items", "system");
    }
    
    // =============== GAME INFO DISPLAY ===============
    
    showPlayerStats() {
        this.addLog("📊 === PLAYER STATISTICS ===", "system");
        this.addLog(`👤 Name: ${this.player.name}`, "system");
        this.addLog(`🎭 Class: ${this.player.class}`, "system");
        this.addLog(`⭐ Level: ${this.player.level}`, "system");
        this.addLog(`🎯 XP: ${this.player.xp}/${this.player.xpToNext}`, "system");
        this.addLog(`❤️ Health: ${this.player.health}/${this.player.maxHealth}`, "system");
        this.addLog(`🔮 Command Power: ${this.player.mana}/${this.player.maxMana}`, "system");
        this.addLog(`🛡️ Armor: ${this.player.armor}/${this.player.maxArmor}`, "system");
        this.addLog(`💰 Gold: ${this.player.gold}`, "system");
        this.addLog(`💎 Soul Shards: ${this.player.soulShards}`, "system");
        this.addLog(`🎖️ Enemies Defeated: ${this.player.kills}`, "system");
        this.addLog(`📍 Location: ${this.player.location} - ${this.player.area}`, "system");
        
        // Game stats
        this.addLog("=== GAME STATS ===", "system");
        this.addLog(`🗓️ Day: ${this.gameDay}`, "system");
        this.addLog(`🔥 Streak: ${this.streak} days`, "system");
        this.addLog(`⏱️ Play Time: ${document.getElementById('playTime').textContent}`, "system");
        this.addLog(`⚔️ Total Damage: ${this.player.stats.totalDamage}`, "system");
        this.addLog(`❤️ Total Healed: ${this.player.stats.totalHealed}`, "system");
        this.addLog(`🏆 Quests Completed: ${this.player.stats.questsCompleted}`, "system");
        this.addLog(`💰 Gold Earned: ${this.player.stats.goldEarned}`, "system");
    }
    
    showQuestInfo() {
        const quest = this.player.activeQuest;
        
        if (!quest) {
            this.addLog("❓ No active quest", "system");
            return;
        }
        
        this.addLog("🎯 === ACTIVE QUEST ===", "system");
        this.addLog(`📜 ${quest.name}`, "system");
        this.addLog(`📝 ${quest.description}`, "system");
        this.addLog(`📊 Progress: ${quest.progress}/${quest.required}`, "system");
        this.addLog(`🎁 Reward: ${quest.reward.xp} XP, ${quest.reward.gold} gold`, "system");
        
        if (quest.completed) {
            this.addLog("✅ QUEST COMPLETED!", "xp");
        }
    }
    
    showHelp() {
        this.addLog("❓ === SOUL COMMANDER HELP ===", "system");
        this.addLog("=== BASIC COMMANDS ===", "system");
        this.addLog("⚔️ fight [enemy] - Battle an enemy", "system");
        this.addLog("🌲 explore [area] - Explore locations", "system");
        this.addLog("🧪 heal - Use health elixir", "system");
        this.addLog("🛌 rest - Rest to recover health/mana", "system");
        this.addLog("🎒 inventory - View inventory", "system");
        this.addLog("📊 stats - View player statistics", "system");
        this.addLog("🎯 quest - View active quest", "system");
        this.addLog("🏪 shop - Visit the shop", "system");
        this.addLog("💾 save - Save your game", "system");
        this.addLog("📂 load - Load saved game", "system");
        this.addLog("🗑️ clear - Clear game log", "system");
        this.addLog("=== ADVANCED COMMANDS ===", "system");
        this.addLog("use [item] - Use an item from inventory", "system");
        this.addLog("equip [item] - Equip a weapon/armor", "system");
        this.addLog("buy [number] - Buy item from shop", "system");
        this.addLog("=== QUICK ACTIONS ===", "system");
        this.addLog("Click equipment slots to use items", "system");
        this.addLog("Use buttons for quick actions", "system");
        this.addLog("Tap suggestions for quick commands", "system");
    }
    
    // =============== SAVE/LOAD SYSTEM ===============
    
    saveGame() {
        const saveData = {
            player: this.player,
            gameDay: this.gameDay,
            streak: this.streak,
            playTime: this.playTime + (this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0),
            lastPlayDate: new Date().toDateString(),
            timestamp: Date.now(),
            version: CONFIG.VERSION
        };
        
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SAVE_DATA, JSON.stringify(saveData));
            this.addLog("💾 Game saved successfully!", "system");
            
            // Visual feedback
            this.showNotification("Game Saved!");
            
            return true;
        } catch (error) {
            this.addLog("❌ Failed to save game: " + error.message, "system");
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
            
            if (!saveData) {
                this.addLog("❌ No saved game found", "system");
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            // Check version compatibility
            if (data.version !== CONFIG.VERSION) {
                this.addLog("⚠️ Save file from different version", "system");
                this.addLog("Some data may not load correctly", "system");
            }
            
            // Load game state
            this.player = data.player;
            this.gameDay = data.gameDay || 1;
            this.streak = data.streak || 0;
            this.playTime = data.playTime || 0;
            this.lastPlayDate = data.lastPlayDate;
            
            // Reset start time for play time calculation
            this.startTime = Date.now();
            
            this.addLog("📂 Game loaded successfully!", "system");
            this.addLog(`🗓️ Last played: ${data.lastPlayDate || 'Unknown'}`, "system");
            
            // Update UI
            this.updateAllUI();
            this.drawCharacter();
            
            return true;
        } catch (error) {
            this.addLog("❌ Failed to load game: " + error.message, "system");
            return false;
        }
    }
    
    autoSaveGame() {
        if (this.settings.autoSave) {
            this.saveGame();
        }
    }
    
    exportData() {
        const saveData = localStorage.getItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
        
        if (!saveData) {
            this.addLog("❌ No game data to export", "system");
            return;
        }
        
        // Create download link
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `soul_commander_save_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.addLog("📤 Game data exported successfully!", "system");
    }
    
    // =============== SETTINGS & UTILITIES ===============
    
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
        
        // Apply settings
        this.applySettings();
    }
    
    saveSettings() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }
    
    applySettings() {
        // Apply sound settings
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = this.settings.soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
        }
        
        // Apply music
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            if (this.settings.musicEnabled) {
                bgMusic.volume = 0.3;
                bgMusic.play().catch(e => console.log('Audio play failed:', e));
            } else {
                bgMusic.pause();
            }
        }
    }
    
    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.saveSettings();
        this.applySettings();
        
        this.addLog(`🔊 Sound ${this.settings.soundEnabled ? 'enabled' : 'disabled'}`, "system");
    }
    
    playSound(soundId, volume = 0.5, loop = false) {
        if (!this.settings.soundEnabled) return;
        
        const soundElement = document.getElementById(soundId);
        if (soundElement) {
            try {
                soundElement.volume = volume;
                soundElement.loop = loop;
                
                if (loop) {
                    soundElement.play().catch(e => console.log('Background music error:', e));
                } else {
                    // Reset and play for one-shot sounds
                    soundElement.currentTime = 0;
                    soundElement.play().catch(e => console.log('Sound play error:', e));
                }
            } catch (error) {
                console.log('Audio error:', error);
            }
        }
    }
    
    checkStreak() {
        const today = new Date().toDateString();
        
        if (this.lastPlayDate) {
            const lastPlay = new Date(this.lastPlayDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastPlay) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                this.streak++;
                this.addLog(`🔥 ${this.streak} day streak!`, "system");
            } else if (diffDays > 1) {
                // Streak broken
                this.streak = 1;
                this.addLog("🔥 New streak started!", "system");
            }
            // diffDays === 0 means same day, keep streak
        } else {
            // First time playing
            this.streak = 1;
        }
        
        this.lastPlayDate = today;
    }
    
    // =============== LOG SYSTEM ===============
    
    addLog(message, type = "system") {
        const logContainer = document.getElementById('gameLog');
        if (!logContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        // Add timestamp
        const now = new Date();
        const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}]`;
        
        logEntry.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-content">${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        
        // Keep max 100 log entries
        while (logContainer.children.length > 100) {
            logContainer.removeChild(logContainer.firstChild);
        }
        
        // Auto-scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Add to internal log for debugging
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    clearGameLog() {
        const logContainer = document.getElementById('gameLog');
        if (logContainer) {
            // Keep only the welcome message
            const welcomeMsg = logContainer.querySelector('.log-entry.welcome');
            logContainer.innerHTML = '';
            
            if (welcomeMsg) {
                logContainer.appendChild(welcomeMsg);
            }
            
            this.addLog("🗑️ Game log cleared", "system");
        }
    }
    
    showNotification(message) {
        if (!this.settings.notifications) return;
        
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${CONFIG.COLORS.PRIMARY};
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        // Add animation styles if not exists
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // =============== PUBLIC METHODS FOR HTML ===============
    
    setCommand(command) {
        const input = document.getElementById('commandInput');
        if (input) {
            input.value = command;
            input.focus();
        }
    }
    
    quickAction(action) {
        const actions = {
            fight: 'fight goblin',
            explore: 'explore',
            rest: 'rest',
            inventory: 'inventory'
        };
        
        if (actions[action]) {
            this.setCommand(actions[action]);
            this.executeCommand();
        }
    }
    
    useEquipment(slot) {
        const messages = {
            weapon: "⚔️ Preparing weapon...",
            skill: "💥 Charging soul skill...",
            armor: "🛡️ Checking armor integrity...",
            accessory: "💎 Activating artifact power...",
            potion: "🧪 Using elixir...",
            special: "🐉 Calling companion..."
        };
        
        this.addLog(messages[slot] || "Using equipment...", "system");
        
        if (slot === 'potion') {
            this.usePotion();
        } else if (slot === 'skill') {
            // Skill usage logic
            this.addLog("💥 Soul skill activated!", "combat");
        }
    }
    
    resetGame() {
        if (confirm("Are you sure you want to reset the game? All progress will be lost!")) {
            this.initializeGameState();
            this.gameDay = 1;
            this.streak = 0;
            this.playTime = 0;
            this.startTime = Date.now();
            
            localStorage.removeItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
            
            this.addLog("🔄 Game reset successfully!", "system");
            this.addLog("🌟 New adventure begins...", "system");
            
            this.updateAllUI();
            this.drawCharacter();
        }
    }
}

// =============== GLOBAL INITIALIZATION ===============

// Global game instance
let soulCommanderGame = null;

// Initialize game
function initSoulCommander() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContainer = document.getElementById('gameContainer');
    
    // Simulate loading progress
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        const loadingBar = document.getElementById('loadingBar');
        if (loadingBar) {
            loadingBar.style.width = `${progress}%`;
        }
        
        // Update loading tip
        const tips = [
            "Loading soul engine...",
            "Initializing command system...",
            "Preparing pixel realms...",
            "Charging soul energy...",
            "Almost ready..."
        ];
        const loadingTip = document.getElementById('loadingTip');
        if (loadingTip && progress % 25 < 5) {
            loadingTip.textContent = tips[Math.floor(progress / 25)];
        }
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            
            // Fade out loading screen
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    if (gameContainer) {
                        gameContainer.style.display = 'flex';
                    }
                    
                    // Initialize game
                    soulCommanderGame = new SoulCommanderGame();
                    soulCommanderGame.startGame();
                    
                    // Focus command input
                    const commandInput = document.getElementById('commandInput');
                    if (commandInput) {
                        commandInput.focus();
                    }
                }, 500);
            }
        }
    }, 200);
}

// Global helper functions for HTML
function executeCommand() {
    if (soulCommanderGame) {
        soulCommanderGame.executeCommand();
    }
}

function handleCommandKey(event) {
    if (soulCommanderGame) {
        soulCommanderGame.handleCommandKey(event);
    }
}

function quickAction(action) {
    if (soulCommanderGame) {
        soulCommanderGame.quickAction(action);
    }
}

function useEquipment(slot) {
    if (soulCommanderGame) {
        soulCommanderGame.useEquipment(slot);
    }
}

function setCommand(command) {
    if (soulCommanderGame) {
        soulCommanderGame.setCommand(command);
    }
}

function clearGameLog() {
    if (soulCommanderGame) {
        soulCommanderGame.clearGameLog();
    }
}

function saveGame() {
    if (soulCommanderGame) {
        soulCommanderGame.saveGame();
    }
}

function loadGame() {
    if (soulCommanderGame) {
        soulCommanderGame.loadGame();
    }
}

function toggleSound() {
    if (soulCommanderGame) {
        soulCommanderGame.toggleSound();
    }
}

function resetGame() {
    if (soulCommanderGame) {
        soulCommanderGame.resetGame();
    }
}

function exportData() {
    if (soulCommanderGame) {
        soulCommanderGame.exportData();
    }
}

// Menu functions
function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

function toggleFullscreen() {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        const btn = document.getElementById('fullscreenBtn');
        if (btn) btn.textContent = "⛶ Exit Fullscreen";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        const btn = document.getElementById('fullscreenBtn');
        if (btn) btn.textContent = "⛶ Fullscreen";
    }
}

// Modal functions
function showHelp() {
    // Implementation for help modal
    console.log('Show help modal');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', initSoulCommander);

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registered:', registration);
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Prevent zoom on mobile
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Export game instance for debugging
window.soulCommander = soulCommanderGame;