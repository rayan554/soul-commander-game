// ============================================
// SOUL COMMANDER v2.0 - CORE GAME ENGINE
// Mobile Optimized • PWA Ready • Complete
// ============================================

// Game Configuration
const CONFIG = {
    GAME_NAME: "Soul Commander",
    VERSION: "2.0.0",
    AUTHOR: "Soul Commander Team",
    
    // Game Settings
    MAX_MESSAGES: 100,
    MAX_VISIBLE_MESSAGES: 15,
    AUTO_SCROLL: true,
    
    // Combat Settings
    CRIT_CHANCE: 0.1,
    DROP_CHANCE: 0.3,
    
    // Storage Keys
    STORAGE_KEYS: {
        SAVE_DATA: "soul_commander_save_v2",
        SETTINGS: "soul_commander_settings_v2",
        STATISTICS: "soul_commander_stats_v2",
        COMMAND_HISTORY: "soul_commander_history_v2"
    },
    
    // Colors
    COLORS: {
        HEALTH: "#FF7675",
        MANA: "#74B9FF",
        XP: "#FFEAA7",
        GOLD: "#FFD700"
    }
};

// Main Game Class
class SoulCommanderGame {
    constructor() {
        this.gameRunning = false;
        this.startTime = null;
        this.playTime = 0;
        this.gameDay = 1;
        this.streak = 0;
        this.lastPlayDate = null;
        
        // Command History
        this.commandHistory = [];
        this.historyIndex = -1;
        
        // Settings
        this.settings = {
            soundEnabled: true,
            musicEnabled: false,
            autoSave: true,
            notifications: true,
            vibration: 'navigator' in window && 'vibrate' in navigator,
            theme: 'dark',
            autoScroll: true
        };
        
        // Game State
        this.player = null;
        this.enemies = [];
        this.locations = [];
        this.shopItems = [];
        this.activeEnemy = null;
        
        // Log System
        this.logMessages = [];
        this.autoScroll = true;
        this.maxMessages = CONFIG.MAX_MESSAGES;
        
        // Initialize
        this.initializeGameState();
        this.loadSettings();
        this.loadCommandHistory();
    }
    
    // =============== INITIALIZATION ===============
    
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
                { id: 1, name: "Health Potion", count: 3, type: "consumable", icon: "🧪" },
                { id: 2, name: "Mana Potion", count: 2, type: "consumable", icon: "🔮" },
                { id: 3, name: "Bronze Dagger", count: 1, type: "weapon", icon: "🗡️" }
            ],
            
            // Active Quest
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
            
            // Statistics
            stats: {
                totalDamage: 0,
                totalHealed: 0,
                enemiesDefeated: 0,
                questsCompleted: 0,
                goldEarned: 0,
                playTime: 0,
                commandsUsed: 0,
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
            combat: ["fight", "attack", "battle", "kill", "assault"],
            explore: ["explore", "travel", "venture", "journey"],
            heal: ["heal", "potion", "cure", "recover"],
            inventory: ["inventory", "inv", "items", "gear"],
            stats: ["stats", "status", "info", "character"],
            quest: ["quest", "mission", "task", "objective"],
            shop: ["shop", "buy", "purchase", "store"],
            help: ["help", "commands", "guide", "?"],
            save: ["save", "store", "backup"],
            load: ["load", "restore", "continue"],
            clear: ["clear", "cls", "clean"],
            rest: ["rest", "sleep", "wait"]
        };
    }
    
    // =============== GAME START ===============
    
    startGame() {
        if (this.gameRunning) return;
        
        console.log(`🚀 ${CONFIG.GAME_NAME} v${CONFIG.VERSION} starting...`);
        
        this.gameRunning = true;
        this.startTime = Date.now();
        this.lastPlayDate = new Date().toDateString();
        
        // Check streak
        this.checkStreak();
        
        // Setup UI
        this.setupUI();
        this.updateAllUI();
        this.drawCharacter();
        
        // Setup mobile optimizations
        this.setupMobileOptimizations();
        
        // Start game loop
        this.gameLoop();
        
        // Welcome messages
        this.addLog(`🎮 Welcome to ${CONFIG.GAME_NAME} v${CONFIG.VERSION}!`, "welcome");
        this.addLog("⚔️ Your journey as a Soul Commander begins...", "system");
        this.addLog(`📍 Location: ${this.player.location} - ${this.player.area}`, "system");
        this.addLog("💡 Type 'help' for commands or use quick actions", "system");
        this.addLog("📱 Mobile optimized • PWA ready • Offline play", "system");
        
        // Load saved game if exists
        setTimeout(() => {
            if (this.loadGame()) {
                this.addLog("💾 Loaded saved game", "system");
            }
        }, 1000);
        
        // Start auto-save interval
        if (this.settings.autoSave) {
            setInterval(() => this.autoSaveGame(), 120000); // Every 2 minutes
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // Update play time
        this.updatePlayTime();
        
        // Animate character
        this.animateCharacter();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // =============== UI MANAGEMENT ===============
    
    setupUI() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup keyboard detection
        this.setupKeyboardDetection();
        
        // Setup log scrolling
        this.setupLogScrolling();
        
        // Setup command history display
        this.updateCommandHistoryDisplay();
        
        // Apply theme
        this.applyTheme();
        
        // Update message counter
        this.updateMessageCounter();
    }
    
    setupEventListeners() {
        const commandInput = document.getElementById('commandInput');
        if (commandInput) {
            commandInput.addEventListener('keydown', (e) => this.handleCommandKey(e));
            commandInput.addEventListener('input', (e) => this.handleInputChange(e));
        }
        
        // Window events
        window.addEventListener('beforeunload', () => this.autoSaveGame());
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
        
        // Visibility change for auto-save
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.settings.autoSave) {
                this.saveGame();
            }
        });
        
        // Touch feedback for buttons
        if (this.settings.vibration) {
            document.querySelectorAll('.command-chip, .equip-slot, .send-btn').forEach(btn => {
                btn.addEventListener('touchstart', () => {
                    navigator.vibrate(10);
                });
            });
        }
    }
    
    setupMobileOptimizations() {
        // Prevent zoom on double tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Better virtual keyboard handling
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            window.addEventListener('resize', () => {
                if (document.activeElement && document.activeElement.id === 'commandInput') {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                } else {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
                }
            });
        }
        
        // Add touch class to body for CSS targeting
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
    }
    
    setupKeyboardDetection() {
        const commandInput = document.getElementById('commandInput');
        const gameContainer = document.querySelector('.game-container');
        
        if (!commandInput || !gameContainer) return;
        
        commandInput.addEventListener('focus', () => {
            gameContainer.classList.add('keyboard-active');
            
            // Scroll input into view on mobile
            if ('ontouchstart' in window) {
                setTimeout(() => {
                    commandInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
        
        commandInput.addEventListener('blur', () => {
            gameContainer.classList.remove('keyboard-active');
        });
    }
    
    setupLogScrolling() {
        const logContainer = document.getElementById('gameLog');
        if (!logContainer) return;
        
        // Setup scroll behavior
        logContainer.addEventListener('scroll', () => {
            const isAtBottom = logContainer.scrollHeight - logContainer.scrollTop <= logContainer.clientHeight + 10;
            
            // Update auto-scroll state
            if (isAtBottom && !this.autoScroll) {
                this.setAutoScroll(true);
            } else if (!isAtBottom && this.autoScroll) {
                this.setAutoScroll(false);
            }
        });
        
        // Tap log to focus input
        logContainer.addEventListener('click', (e) => {
            if (e.target === logContainer || e.target.classList.contains('log-entry')) {
                document.getElementById('commandInput').focus();
            }
        });
        
        // Swipe detection for mobile
        let touchStartY = 0;
        logContainer.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        logContainer.addEventListener('touchmove', (e) => {
            if (document.activeElement.id === 'commandInput') {
                const touchY = e.touches[0].clientY;
                const diff = touchStartY - touchY;
                
                // If significant swipe up, blur input
                if (diff > 50) {
                    document.activeElement.blur();
                }
            }
        }, { passive: true });
    }
    
    // =============== COMMAND SYSTEM ===============
    
    handleCommandKey(event) {
        const input = event.target;
        
        switch(event.key) {
            case 'Enter':
                event.preventDefault();
                this.executeCommand();
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.navigateCommandHistory(-1);
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.navigateCommandHistory(1);
                break;
                
            case 'Tab':
                event.preventDefault();
                this.autoCompleteCommand();
                break;
                
            case 'Escape':
                input.blur();
                break;
        }
    }
    
    handleInputChange(event) {
        const input = event.target.value.toLowerCase();
        this.updateCommandSuggestions(input);
        
        // Reset history index when typing
        if (input !== (this.commandHistory[this.historyIndex] || '')) {
            this.historyIndex = -1;
        }
    }
    
    executeCommand() {
        const input = document.getElementById('commandInput');
        const command = input.value.trim();
        
        if (!command) {
            this.vibrate(50);
            return;
        }
        
        // Clear input immediately for better UX
        input.value = '';
        
        // Add to history
        this.addToCommandHistory(command);
        
        // Haptic feedback
        this.vibrate(20);
        
        // Play sound
        this.playSound('click');
        
        // Process command
        this.processCommand(command);
        
        // Maintain focus
        setTimeout(() => input.focus(), 100);
        
        // Update stats
        this.player.stats.commandsUsed++;
    }
    
    processCommand(command) {
        this.addLog(`> ${command}`, "system");
        
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
            this.showStats();
        } else if (this.commands.quest.includes(action)) {
            this.showQuest();
        } else if (this.commands.shop.includes(action)) {
            this.openShop();
        } else if (this.commands.help.includes(action)) {
            this.showHelp();
        } else if (this.commands.save.includes(action)) {
            this.saveGame();
        } else if (this.commands.load.includes(action)) {
            this.loadGame();
        } else if (this.commands.clear.includes(action)) {
            this.clearLog();
        } else if (this.commands.rest.includes(action)) {
            this.rest();
        } else if (action === 'use') {
            this.useItem(args);
        } else if (action === 'equip') {
            this.equipItem(args);
        } else if (action === 'buy' && args.length > 0) {
            this.buyItem(parseInt(args[0]));
        } else {
            this.addLog(`❓ Unknown command: "${action}"`, "system");
            this.addLog("💡 Type 'help' for available commands", "system");
        }
        
        // Update command history display
        this.updateCommandHistoryDisplay();
    }
    
    navigateCommandHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        const input = document.getElementById('commandInput');
        
        if (direction === -1) { // Up
            this.historyIndex = Math.min(this.commandHistory.length - 1, this.historyIndex + 1);
        } else { // Down
            this.historyIndex = Math.max(-1, this.historyIndex - 1);
        }
        
        if (this.historyIndex >= 0) {
            input.value = this.commandHistory[this.historyIndex];
        } else {
            input.value = '';
        }
    }
    
    addToCommandHistory(command) {
        // Don't add duplicates in a row
        if (this.commandHistory[0] !== command) {
            this.commandHistory.unshift(command);
            
            // Keep only last 20 commands
            if (this.commandHistory.length > 20) {
                this.commandHistory.pop();
            }
            
            // Save to localStorage
            this.saveCommandHistory();
        }
        
        this.historyIndex = -1;
    }
    
    updateCommandSuggestions(input) {
        const quickChips = document.getElementById('quickChips');
        if (!quickChips) return;
        
        // Filter quick chips based on input
        const chips = quickChips.querySelectorAll('.command-chip');
        chips.forEach(chip => {
            const text = chip.textContent.toLowerCase();
            if (input && text.includes(input)) {
                chip.style.opacity = '1';
                chip.style.order = '0';
            } else if (input) {
                chip.style.opacity = '0.5';
                chip.style.order = '1';
            } else {
                chip.style.opacity = '1';
                chip.style.order = '0';
            }
        });
    }
    
    autoCompleteCommand() {
        const input = document.getElementById('commandInput');
        const current = input.value.toLowerCase().trim();
        
        if (!current) {
            this.showCommandSuggestions();
            return;
        }
        
        // Find matching commands
        const allCommands = Object.values(this.commands).flat();
        const matches = allCommands.filter(cmd => cmd.startsWith(current));
        
        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            this.addLog(`🔍 Matching commands: ${matches.slice(0, 5).join(', ')}`, "system");
        }
        
        input.focus();
        input.setSelectionRange(current.length, input.value.length);
    }
    
    showCommandSuggestions() {
        const suggestions = [
            "⚔️  fight [enemy] - Battle an enemy",
            "🌲  explore [area] - Explore locations",
            "🧪  heal - Use health potion",
            "🎒  inventory - Show inventory",
            "📊  stats - Show player stats",
            "🛌  rest - Rest to recover",
            "🏪  shop - Visit the shop",
            "🎯  quest - Show active quest",
            "💾  save - Save game",
            "📂  load - Load game"
        ];
        
        this.addLog("📋 Quick commands:", "system");
        suggestions.forEach(cmd => {
            this.addLog(cmd, "system");
        });
    }
    
    updateCommandHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        // Show last 5 commands
        const recentCommands = this.commandHistory.slice(0, 5);
        
        recentCommands.forEach(cmd => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = cmd;
            item.onclick = () => {
                document.getElementById('commandInput').value = cmd;
                document.getElementById('commandInput').focus();
            };
            historyList.appendChild(item);
        });
        
        if (recentCommands.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'history-item';
            empty.textContent = "No commands yet";
            empty.style.opacity = '0.5';
            historyList.appendChild(empty);
        }
    }
    
    // =============== COMBAT SYSTEM ===============
    
    handleCombat(args) {
        const enemyName = args.join(' ') || 'goblin';
        const enemy = this.findEnemy(enemyName);
        
        if (!enemy) {
            this.addLog(`❓ Enemy "${enemyName}" not found.`, "system");
            this.addLog(`💡 Try: ${this.enemies.map(e => e.name.toLowerCase()).join(', ')}`, "system");
            return;
        }
        
        // Check if player can fight
        if (this.player.health <= 0) {
            this.addLog("💀 You are too weak to fight! Heal first.", "combat");
            return;
        }
        
        // Set active enemy
        this.activeEnemy = { ...enemy };
        
        // Start combat
        this.combatRound();
    }
    
    findEnemy(name) {
        return this.enemies.find(enemy => 
            enemy.name.toLowerCase().includes(name.toLowerCase()) ||
            enemy.id.toLowerCase() === name.toLowerCase()
        ) || this.enemies[0];
    }
    
    combatRound() {
        if (!this.activeEnemy) return;
        
        const enemy = this.activeEnemy;
        
        this.addLog(`⚔️ You encounter a ${enemy.name}!`, "combat");
        
        // Player attack
        const playerDamage = this.calculateDamage(this.player.equipment.weapon.damage);
        const isCritical = Math.random() < CONFIG.CRIT_CHANCE;
        const actualPlayerDamage = isCritical ? Math.floor(playerDamage * 1.5) : playerDamage;
        
        enemy.health -= actualPlayerDamage;
        
        if (isCritical) {
            this.addLog(`💥 CRITICAL HIT! You deal ${actualPlayerDamage} damage!`, "combat");
            this.screenShake();
            this.vibrate(100);
        } else {
            this.addLog(`🎯 You attack for ${actualPlayerDamage} damage`, "combat");
        }
        
        // Check if enemy defeated
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
        
        if (armorReduction > 0) {
            this.addLog(`🛡️ Armor absorbed ${armorReduction} damage`, "system");
        }
        
        // Check if player defeated
        if (this.player.health <= 0) {
            this.playerDefeated();
            return;
        }
        
        // Update display
        this.addLog(`❤️ Your Health: ${this.player.health}/${this.player.maxHealth}`, "combat");
        this.addLog(`💀 ${enemy.name} Health: ${enemy.health}/${enemy.maxHealth}`, "combat");
        
        // Update UI
        this.updateHealthBars();
        this.updateStatsDisplay();
        
        // Play combat sound
        this.playSound('combat');
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
        
        // Log messages
        this.addLog(`🏆 ${enemy.name} defeated!`, "combat");
        this.addLog(`⭐ +${xpGain} XP`, "xp");
        this.addLog(`💰 +${goldGain} Gold`, "loot");
        this.addLog(`💎 +${soulShardGain} Soul Shards`, "loot");
        
        // Check for level up
        if (this.player.xp >= this.player.xpToNext) {
            this.levelUp();
        }
        
        // Random loot
        if (Math.random() < enemy.lootChance) {
            this.dropLoot(enemy);
        }
        
        // Reset enemy
        this.activeEnemy = null;
        
        // Update UI
        this.updateAllUI();
        
        // Victory effect
        this.victoryEffect();
    }
    
    dropLoot(enemy) {
        const lootTable = [
            { name: "Health Potion", chance: 0.5, type: "consumable" },
            { name: "Mana Potion", chance: 0.3, type: "consumable" },
            { name: "Iron Dagger", chance: 0.15, type: "weapon" },
            { name: "Magic Scroll", chance: 0.05, type: "special" }
        ];
        
        const loot = this.weightedRandom(lootTable);
        
        // Add to inventory
        const existingItem = this.player.inventory.find(i => i.name === loot.name);
        if (existingItem) {
            existingItem.count++;
        } else {
            this.player.inventory.push({
                id: Date.now(),
                name: loot.name,
                count: 1,
                type: loot.type,
                icon: loot.type === "consumable" ? "🧪" : "🗡️"
            });
        }
        
        this.addLog(`🎁 Loot dropped: ${loot.name}`, "loot");
    }
    
    playerDefeated() {
        this.addLog("💀 YOU HAVE BEEN DEFEATED!", "combat");
        this.addLog("Your soul returns to the Sanctuary...", "system");
        
        // Penalty
        const goldLoss = Math.floor(this.player.gold * 0.1);
        this.player.gold = Math.max(0, this.player.gold - goldLoss);
        
        // Reset stats
        this.player.health = Math.floor(this.player.maxHealth * 0.25);
        this.player.mana = Math.floor(this.player.maxMana * 0.25);
        this.player.armor = Math.floor(this.player.maxArmor * 0.25);
        this.player.location = "Sanctuary";
        this.player.area = "Town Square";
        this.activeEnemy = null;
        
        // Update UI
        this.updateAllUI();
        
        // Defeat effect
        this.defeatEffect();
        
        this.addLog(`💰 Lost ${goldLoss} gold as penalty`, "system");
        this.addLog("💡 Rest and heal before fighting again", "system");
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
    
    // =============== EXPLORATION SYSTEM ===============
    
    handleExplore(args) {
        const areaName = args.join(' ') || '';
        
        if (areaName) {
            this.travelToArea(areaName);
        } else {
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
                const enemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                this.addLog(`⚠️ You encountered a ${enemy.name}!`, "combat");
                this.addLog(`💡 Type 'fight ${enemy.name.toLowerCase()}' to attack`, "system");
                break;
                
            case "treasure":
                const treasureGold = Math.floor(Math.random() * 50) + 20;
                this.player.gold += treasureGold;
                this.addLog(`💰 Found hidden treasure! +${treasureGold} Gold`, "loot");
                break;
                
            case "special":
                this.addLog("🌟 You discover an ancient shrine!", "system");
                this.addLog("✨ Your soul feels empowered...", "heal");
                this.player.maxHealth += 5;
                this.player.health += 5;
                break;
                
            default:
                this.addLog("You wander but find nothing of interest...", "system");
        }
        
        this.addLog(`⚡ Mana -${energyCost}`, "system");
        this.updateAllUI();
    }
    
    travelToArea(areaName) {
        const currentLocation = this.locations.find(loc => 
            loc.name.toLowerCase() === this.player.location.toLowerCase()
        );
        
        if (!currentLocation) {
            this.addLog("❓ Cannot find location information", "system");
            return;
        }
        
        const area = currentLocation.areas.find(a => 
            a.toLowerCase().includes(areaName.toLowerCase())
        );
        
        if (!area) {
            this.addLog(`❓ Area "${areaName}" not found in ${this.player.location}`, "system");
            this.addLog(`📍 Available: ${currentLocation.areas.join(', ')}`, "system");
            return;
        }
        
        const travelCost = 5;
        if (this.player.mana < travelCost) {
            this.addLog("⚡ Not enough mana to travel!", "system");
            return;
        }
        
        this.player.area = area;
        this.player.mana -= travelCost;
        
        this.addLog(`🚶 Traveling to ${area}...`, "system");
        this.addLog(`📍 Arrived at ${area}`, "system");
        this.addLog(`⚡ Mana -${travelCost}`, "system");
        
        // Random encounter
        if (Math.random() < (currentLocation.danger * 0.2)) {
            setTimeout(() => {
                const enemy = this.enemies[
                    Math.floor(Math.random() * Math.min(this.enemies.length, currentLocation.danger + 2))
                ];
                this.addLog(`⚠️ Ambushed by a ${enemy.name}!`, "combat");
                this.addLog(`💡 Type 'fight ${enemy.name.toLowerCase()}' to defend`, "system");
            }, 1000);
        }
        
        this.updateAllUI();
    }
    
    // =============== HEALING & REST ===============
    
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
            this.addLog("❌ No potions remaining!", "system");
            return;
        }
        
        if (this.player.health >= this.player.maxHealth) {
            this.addLog("✅ Already at full health!", "system");
            return;
        }
        
        potion.count--;
        const healAmount = potion.heal;
        const oldHealth = this.player.health;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
        const actualHeal = this.player.health - oldHealth;
        
        this.player.stats.totalHealed += actualHeal;
        
        this.addLog(`🧪 Used ${potion.name}!`, "heal");
        this.addLog(`❤️ +${actualHeal} Health`, "heal");
        this.addLog(`📦 Potions: ${potion.count}`, "heal");
        
        this.healEffect();
        this.updateAllUI();
    }
    
    rest() {
        if (this.player.health >= this.player.maxHealth && 
            this.player.mana >= this.player.maxMana) {
            this.addLog("✅ Already fully rested!", "system");
            return;
        }
        
        this.addLog("🛌 You take a moment to rest...", "system");
        
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
            this.addLog(`🔮 +${manaRestored} Mana`, "heal");
        }
        
        // Advance game day
        if (healthRestored > 10) {
            this.gameDay++;
            this.addLog(`📅 Day ${this.gameDay} begins...`, "system");
        }
        
        this.updateAllUI();
        this.restEffect();
    }
    
    // =============== INVENTORY & ITEMS ===============
    
    showInventory() {
        this.addLog("🎒 === INVENTORY ===", "system");
        this.addLog("⚔️ Equipped:", "system");
        
        Object.entries(this.player.equipment).forEach(([slot, item]) => {
            this.addLog(`${item.icon} ${slot}: ${item.name}`, "system");
        });
        
        this.addLog("📦 Items:", "system");
        
        if (this.player.inventory.length === 0) {
            this.addLog("Empty", "system");
        } else {
            this.player.inventory.forEach(item => {
                this.addLog(`${item.icon} ${item.name} x${item.count}`, "system");
            });
        }
        
        this.addLog("💡 Use 'use [item]' or 'equip [item]'", "system");
    }
    
    useItem(args) {
        if (args.length === 0) {
            this.addLog("❓ Usage: use [item name]", "system");
            return;
        }
        
        const itemName = args.join(' ').toLowerCase();
        const item = this.player.inventory.find(i => 
            i.name.toLowerCase().includes(itemName)
        );
        
        if (!item) {
            this.addLog(`❓ Item "${args.join(' ')}" not found`, "system");
            return;
        }
        
        switch(item.type) {
            case 'consumable':
                this.useConsumable(item);
                break;
            case 'weapon':
                this.equipWeapon(item);
                break;
            default:
                this.addLog(`📦 Used ${item.name}`, "system");
                item.count--;
                if (item.count <= 0) {
                    this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
                }
        }
        
        this.updateAllUI();
    }
    
    useConsumable(item) {
        if (item.name.toLowerCase().includes('health')) {
            const healAmount = 30;
            const oldHealth = this.player.health;
            this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
            const actualHeal = this.player.health - oldHealth;
            
            this.addLog(`🧪 Used ${item.name}!`, "heal");
            this.addLog(`❤️ +${actualHeal} Health`, "heal");
            
            this.healEffect();
        } else if (item.name.toLowerCase().includes('mana')) {
            const manaAmount = 20;
            const oldMana = this.player.mana;
            this.player.mana = Math.min(this.player.maxMana, this.player.mana + manaAmount);
            const actualMana = this.player.mana - oldMana;
            
            this.addLog(`🔮 Used ${item.name}!`, "heal");
            this.addLog(`⚡ +${actualMana} Mana`, "heal");
        }
        
        item.count--;
        if (item.count <= 0) {
            this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
        }
    }
    
    equipWeapon(item) {
        const oldWeapon = this.player.equipment.weapon;
        
        this.player.equipment.weapon = {
            name: item.name,
            icon: "⚔️",
            damage: "20-30",
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
                id: Date.now(),
                name: oldWeapon.name,
                count: 1,
                type: "weapon",
                icon: "⚔️"
            });
        }
        
        // Remove equipped item
        item.count--;
        if (item.count <= 0) {
            this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
        }
    }
    
    equipItem(args) {
        this.useItem(args);
    }
    
    // =============== SHOP SYSTEM ===============
    
    openShop() {
        this.addLog("🏪 === SOUL MARKET ===", "system");
        this.addLog(`💰 Your Gold: ${this.player.gold}`, "system");
        this.addLog("Items for sale:", "system");
        
        this.shopItems.forEach((item, index) => {
            this.addLog(`${index + 1}. ${item.name} - ${item.price} gold`, "system");
            if (item.effect) {
                this.addLog(`   Effect: ${item.effect}`, "system");
            }
        });
        
        this.addLog("💡 Use 'buy [number]' to purchase", "system");
    }
    
    buyItem(itemNumber) {
        const itemIndex = itemNumber - 1;
        
        if (itemIndex < 0 || itemIndex >= this.shopItems.length) {
            this.addLog(`❓ Item number ${itemNumber} not found`, "system");
            return;
        }
        
        const item = this.shopItems[itemIndex];
        
        if (this.player.gold < item.price) {
            this.addLog(`❌ Not enough gold! Need ${item.price}, have ${this.player.gold}`, "system");
            return;
        }
        
        this.player.gold -= item.price;
        
        // Add to inventory
        const existingItem = this.player.inventory.find(i => i.name === item.name);
        if (existingItem) {
            existingItem.count++;
        } else {
            this.player.inventory.push({
                id: Date.now(),
                name: item.name,
                count: 1,
                type: item.type,
                icon: item.type === "consumable" ? "🧪" : 
                       item.type === "weapon" ? "⚔️" :
                       item.type === "armor" ? "🛡️" : "💎"
            });
        }
        
        this.addLog(`✅ Purchased ${item.name} for ${item.price} gold`, "loot");
        this.updateAllUI();
    }
    
        // =============== LEVEL & PROGRESSION ===============
    
    levelUp() {
        this.player.level++;
        this.player.xp -= this.player.xpToNext;
        this.player.xpToNext = Math.floor(this.player.xpToNext * 1.5);
        
        // Stat increases
        this.player.maxHealth += 20;
        this.player.health = this.player.maxHealth;
        this.player.maxMana += 10;
        this.player.mana = this.player.maxMana;
        this.player.maxArmor += 15;
        this.player.armor = this.player.maxArmor;
        
        this.addLog(`✨ LEVEL UP! You are now Level ${this.player.level}!`, "xp");
        this.addLog(`❤️ Max Health: ${this.player.maxHealth}`, "heal");
        this.addLog(`🔮 Max Mana: ${this.player.maxMana}`, "heal");
        this.addLog(`🛡️ Max Armor: ${this.player.maxArmor}`, "heal");
        
        this.levelUpEffect();
        
        // Check for multiple level ups
        if (this.player.xp >= this.player.xpToNext) {
            setTimeout(() => this.levelUp(), 1000);
        }
        
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
            const existingItem = this.player.inventory.find(i => i.name === quest.reward.item);
            if (existingItem) {
                existingItem.count++;
            } else {
                this.player.inventory.push({
                    id: Date.now(),
                    name: quest.reward.item,
                    count: 1,
                    type: "weapon",
                    icon: "⚔️"
                });
            }
        }
        
        // Generate new quest
        this.generateNewQuest();
        this.updateAllUI();
        this.questCompleteEffect();
    }
    
    generateNewQuest() {
        const questTypes = [
            {
                type: "combat",
                templates: [
                    { name: "Soul Hunter", desc: "Defeat {count} enemies", required: 5 },
                    { name: "Goblin Exterminator", desc: "Eliminate {count} goblins", required: 10 }
                ]
            },
            {
                type: "collection",
                templates: [
                    { name: "Gold Collector", desc: "Gather {count} gold", required: 500 }
                ]
            }
        ];
        
        const randomType = questTypes[Math.floor(Math.random() * questTypes.length)];
        const template = randomType.templates[Math.floor(Math.random() * randomType.templates.length)];
        
        this.player.activeQuest = {
            id: `quest_${Date.now()}`,
            name: template.name,
            description: template.desc.replace('{count}', template.required),
            type: randomType.type,
            target: randomType.type === "combat" ? "enemy" : "item",
            required: template.required,
            progress: 0,
            completed: false,
            reward: {
                xp: this.player.level * 50,
                gold: this.player.level * 25,
                item: this.getRandomItemReward()
            }
        };
        
        this.addLog(`🎯 New Quest: ${this.player.activeQuest.name}`, "system");
        this.addLog(`📝 ${this.player.activeQuest.description}`, "system");
    }
    
    getRandomItemReward() {
        const items = ["Health Potion", "Mana Potion", "Iron Sword", "Steel Armor"];
        return items[Math.floor(Math.random() * items.length)];
    }
    
    // =============== LOG SYSTEM ===============
    
    addLog(message, type = "system") {
        const timestamp = new Date();
        const timeString = `[${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}]`;
        
        const logEntry = {
            id: Date.now(),
            message,
            type,
            timestamp,
            timeString
        };
        
        // Add to array
        this.logMessages.push(logEntry);
        
        // Keep only max messages
        if (this.logMessages.length > this.maxMessages) {
            this.logMessages.shift();
        }
        
        // Update UI
        this.updateLogUI();
        
        // Auto-scroll if enabled
        if (this.autoScroll) {
            setTimeout(() => this.scrollLogToBottom(), 50);
        }
        
        // Update counter
        this.updateMessageCounter();
        
        // Console log for debugging
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        return logEntry;
    }
    
    updateLogUI() {
        const logContainer = document.getElementById('gameLog');
        if (!logContainer) return;
        
        // Get last visible messages
        const visibleMessages = this.logMessages.slice(-CONFIG.MAX_VISIBLE_MESSAGES);
        
        // Clear and rebuild
        logContainer.innerHTML = '';
        
        visibleMessages.forEach(logEntry => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${logEntry.type}`;
            logElement.innerHTML = `
                <span class="log-time">${logEntry.timeString}</span>
                <span class="log-content">${logEntry.message}</span>
            `;
            logContainer.appendChild(logElement);
        });
    }
    
    scrollLogToBottom() {
        const logContainer = document.getElementById('gameLog');
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }
    
    scrollLogToTop() {
        const logContainer = document.getElementById('gameLog');
        if (logContainer) {
            logContainer.scrollTop = 0;
        }
    }
    
    setAutoScroll(enabled) {
        this.autoScroll = enabled;
        
        const autoScrollBtn = document.getElementById('autoScrollBtn');
        const logHint = document.getElementById('logHint');
        
        if (autoScrollBtn) {
            autoScrollBtn.textContent = enabled ? '🔽' : '⏸️';
            autoScrollBtn.title = enabled ? 'Auto-scroll ON' : 'Auto-scroll OFF';
        }
        
        if (logHint) {
            logHint.textContent = enabled ? 
                '↓ Auto-scroll ON • Tap log to focus input' :
                '⏸️ Auto-scroll OFF • Scroll manually';
        }
        
        // Scroll to bottom if enabling
        if (enabled) {
            this.scrollLogToBottom();
        }
    }
    
    toggleAutoScroll() {
        this.setAutoScroll(!this.autoScroll);
    }
    
    updateMessageCounter() {
        const counter = document.getElementById('logCounter');
        if (counter) {
            counter.textContent = `${this.logMessages.length}/${this.maxMessages}`;
            
            // Warning color if almost full
            if (this.logMessages.length > this.maxMessages * 0.8) {
                counter.style.color = CONFIG.COLORS.HEALTH;
            } else {
                counter.style.color = '';
            }
        }
    }
    
    clearLog() {
        this.logMessages = [];
        this.updateLogUI();
        this.updateMessageCounter();
        this.addLog("🗑️ Game log cleared", "system");
    }
    
    // =============== UI UPDATES ===============
    
    updateAllUI() {
        this.updateHealthBars();
        this.updateStatsDisplay();
        this.updateEquipmentDisplay();
        this.updateQuestDisplay();
        this.updateCharacterInfo();
        
        // Auto-save if enabled
        if (this.settings.autoSave) {
            setTimeout(() => this.autoSaveGame(), 1000);
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
        // Basic stats
        document.getElementById('charLevel').textContent = this.player.level;
        document.getElementById('goldValue').textContent = this.player.gold.toLocaleString();
        document.getElementById('killsValue').textContent = this.player.kills;
        document.getElementById('locationValue').textContent = this.player.area;
        document.getElementById('gameDayValue').textContent = this.gameDay;
        
        // Update play time
        this.updatePlayTime();
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
        
        this.player.stats.playTime = elapsed;
    }
    
    updateEquipmentDisplay() {
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
    
    updateConnectionStatus(online) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = online ? 
                "🟢 Online • PWA Ready" : 
                "🔴 Offline • Playing Local";
            statusElement.style.color = online ? 
                CONFIG.COLORS.XP : 
                CONFIG.COLORS.HEALTH;
        }
    }
    
    // =============== CHARACTER GRAPHICS ===============
    
    drawCharacter() {
        const canvas = document.getElementById('characterCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw character body
        ctx.fillStyle = '#6C5CE7';
        ctx.fillRect(32, 48, 64, 40); // Body
        
        // Head
        ctx.fillStyle = '#FFEAA7';
        ctx.fillRect(40, 24, 48, 30);
        
        // Eyes
        ctx.fillStyle = '#2D3436';
        ctx.fillRect(48, 36, 8, 8);
        ctx.fillRect(72, 36, 8, 8);
        
        // Weapon
        ctx.fillStyle = '#B2BEC3';
        ctx.fillRect(16, 56, 16, 6); // Handle
        ctx.fillRect(12, 48, 24, 20); // Blade
        
        // Armor details
        ctx.fillStyle = '#00CEC9';
        ctx.fillRect(36, 56, 56, 10); // Chest
        ctx.fillRect(32, 80, 64, 8); // Belt
        
        // Health-based glow
        const healthPercent = this.player.health / this.player.maxHealth;
        if (healthPercent < 0.3) {
            ctx.shadowColor = CONFIG.COLORS.HEALTH;
            ctx.shadowBlur = 10 + Math.sin(Date.now() / 200) * 5;
            ctx.fillRect(32, 48, 64, 40);
            ctx.shadowBlur = 0;
        }
    }
    
    animateCharacter() {
        const canvas = document.getElementById('characterCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const time = Date.now() / 1000;
        
        // Gentle floating animation
        const floatOffset = Math.sin(time) * 1.5;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(0, floatOffset);
        this.drawCharacter();
        ctx.restore();
    }
    
    // =============== VISUAL EFFECTS ===============
    
    screenShake() {
        const container = document.querySelector('.game-container');
        if (container) {
            container.style.animation = 'shake 0.5s';
            setTimeout(() => {
                container.style.animation = '';
            }, 500);
        }
    }
    
    victoryEffect() {
        this.createParticles(CONFIG.COLORS.XP, 10);
        this.playSound('victory');
    }
    
    defeatEffect() {
        const container = document.querySelector('.game-container');
        if (container) {
            container.style.boxShadow = `0 0 30px ${CONFIG.COLORS.HEALTH}`;
            setTimeout(() => {
                container.style.boxShadow = '';
            }, 1000);
        }
    }
    
    healEffect() {
        const healthBar = document.getElementById('healthBar');
        if (healthBar) {
            healthBar.style.boxShadow = `0 0 15px ${CONFIG.COLORS.HEALTH}`;
            setTimeout(() => {
                healthBar.style.boxShadow = '';
            }, 1000);
        }
        this.createParticles(CONFIG.COLORS.HEALTH, 5);
    }
    
    levelUpEffect() {
        this.createParticles(CONFIG.COLORS.XP, 15);
        this.vibrate(200);
    }
    
    questCompleteEffect() {
        this.createParticles('#FFD700', 8);
    }
    
    restEffect() {
        this.createParticles(CONFIG.COLORS.MANA, 6);
    }
    
    createParticles(color, count) {
        const container = document.querySelector('.game-container');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat 1s ease-out forwards;
            `;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    vibrate(duration = 50) {
        if (this.settings.vibration && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    playSound(soundId) {
        if (!this.settings.soundEnabled) return;
        
        // In a real implementation, you would have audio files
        // For now, we'll just log it
        console.log(`Playing sound: ${soundId}`);
    }
    
    // =============== SETTINGS MANAGEMENT ===============
    
    loadSettings() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        this.applySettings();
    }
    
    saveSettings() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }
    
    applySettings() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Update theme button
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.textContent = this.settings.theme === 'dark' ? '🌙' : '☀️';
        }
        
        // Update sound button
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.innerHTML = `<span class="menu-icon">${this.settings.soundEnabled ? '🔊' : '🔇'}</span> Sound: ${this.settings.soundEnabled ? 'ON' : 'OFF'}`;
        }
        
        // Apply auto-scroll
        this.setAutoScroll(this.settings.autoScroll);
    }
    
    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.saveSettings();
        this.applySettings();
        this.addLog(`🔊 Sound ${this.settings.soundEnabled ? 'enabled' : 'disabled'}`, "system");
    }
    
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.saveSettings();
        this.applySettings();
        this.addLog(`🎨 Theme: ${this.settings.theme}`, "system");
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
            this.showNotification("Game Saved!");
            return true;
        } catch (error) {
            this.addLog("❌ Failed to save game", "system");
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
            
            if (!saveData) {
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            // Check version
            if (data.version !== CONFIG.VERSION) {
                this.addLog("⚠️ Save file from different version", "system");
            }
            
            // Load game state
            this.player = data.player;
            this.gameDay = data.gameDay || 1;
            this.streak = data.streak || 0;
            this.playTime = data.playTime || 0;
            this.lastPlayDate = data.lastPlayDate;
            
            // Reset start time
            this.startTime = Date.now();
            
            this.addLog("📂 Game loaded successfully!", "system");
            
            // Update UI
            this.updateAllUI();
            this.drawCharacter();
            
            return true;
        } catch (error) {
            this.addLog("❌ Failed to load game", "system");
            return false;
        }
    }
    
    autoSaveGame() {
        if (this.settings.autoSave && this.gameRunning) {
            this.saveGame();
        }
    }
    
    saveCommandHistory() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.COMMAND_HISTORY, JSON.stringify(this.commandHistory));
        } catch (e) {
            console.warn('Failed to save command history:', e);
        }
    }
    
    loadCommandHistory() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.COMMAND_HISTORY);
            if (saved) {
                this.commandHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load command history:', e);
        }
    }
    
    // =============== UTILITY FUNCTIONS ===============
    
    checkStreak() {
        const today = new Date().toDateString();
        
        if (this.lastPlayDate) {
            const lastPlay = new Date(this.lastPlayDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastPlay) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                this.streak++;
                this.addLog(`🔥 ${this.streak} day streak!`, "system");
            } else if (diffDays > 1) {
                this.streak = 1;
                this.addLog("🔥 New streak started!", "system");
            }
        } else {
            this.streak = 1;
        }
        
        this.lastPlayDate = today;
    }
    
    showNotification(message) {
        if (!this.settings.notifications || !('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            new Notification(CONFIG.GAME_NAME, {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚔️</text></svg>'
            });
        }
    }
    
    // =============== PUBLIC METHODS FOR HTML ===============
    
    showStats() {
        this.addLog("📊 === PLAYER STATS ===", "system");
        this.addLog(`👤 Name: ${this.player.name}`, "system");
        this.addLog(`🎭 Class: ${this.player.class}`, "system");
        this.addLog(`⭐ Level: ${this.player.level}`, "system");
        this.addLog(`🎯 XP: ${this.player.xp}/${this.player.xpToNext}`, "system");
        this.addLog(`❤️ Health: ${this.player.health}/${this.player.maxHealth}`, "system");
        this.addLog(`🔮 Mana: ${this.player.mana}/${this.player.maxMana}`, "system");
        this.addLog(`🛡️ Armor: ${this.player.armor}/${this.player.maxArmor}`, "system");
        this.addLog(`💰 Gold: ${this.player.gold}`, "system");
        this.addLog(`💎 Soul Shards: ${this.player.soulShards}`, "system");
        this.addLog(`🎖️ Kills: ${this.player.kills}`, "system");
        this.addLog(`📅 Day: ${this.gameDay}`, "system");
        this.addLog(`🔥 Streak: ${this.streak} days`, "system");
        this.addLog(`📍 Location: ${this.player.location} - ${this.player.area}`, "system");
    }
    
    showQuest() {
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
        this.addLog("🧪 heal - Use health potion", "system");
        this.addLog("🛌 rest - Rest to recover health/mana", "system");
        this.addLog("🎒 inventory - View inventory", "system");
        this.addLog("📊 stats - View player statistics", "system");
        this.addLog("🎯 quest - View active quest", "system");
        this.addLog("🏪 shop - Visit the shop", "system");
        this.addLog("=== ADVANCED COMMANDS ===", "system");
        this.addLog("use [item] - Use an item from inventory", "system");
        this.addLog("equip [item] - Equip a weapon/armor", "system");
        this.addLog("buy [number] - Buy item from shop", "system");
        this.addLog("save - Save your game", "system");
        this.addLog("load - Load saved game", "system");
        this.addLog("clear - Clear game log", "system");
        this.addLog("=== MOBILE TIPS ===", "system");
        this.addLog("• Tap equipment slots to use items", "system");
        this.addLog("• Use quick command chips for speed", "system");
        this.addLog("• Swipe game log to scroll", "system");
        this.addLog("• Add to home screen for app experience", "system");
    }
    
    exportData() {
        const saveData = localStorage.getItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
        
        if (!saveData) {
            this.addLog("❌ No game data to export", "system");
            return;
        }
        
        // Create download
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `soul_commander_save_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.addLog("📤 Game data exported!", "system");
    }
    
    resetGame() {
        if (confirm("Reset game? All progress will be lost!")) {
            this.initializeGameState();
            this.gameDay = 1;
            this.streak = 0;
            this.playTime = 0;
            this.startTime = Date.now();
            this.logMessages = [];
            this.commandHistory = [];
            
            localStorage.removeItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
            
            this.addLog("🔄 Game reset successfully!", "system");
            this.addLog("🌟 New adventure begins...", "system");
            
            this.updateAllUI();
            this.drawCharacter();
            this.updateCommandHistoryDisplay();
        }
    }
}

// =============== GLOBAL INITIALIZATION ===============

// Global game instance
let soulCommanderGame = null;

// Initialize the game
function initSoulCommander() {
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContainer = document.getElementById('gameContainer');
    
    // Simulate loading progress
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        const loadingBar = document.getElementById('loadingBar');
        if (loadingBar) {
            loadingBar.style.width = `${progress}%`;
        }
        
        const tips = [
            "Initializing soul engine...",
            "Loading pixel realms...",
            "Charging command system...",
            "Preparing for adventure...",
            "Almost ready..."
        ];
        const loadingTip = document.getElementById('loadingTip');
        if (loadingTip && progress % 20 < 5) {
            loadingTip.textContent = tips[Math.floor(progress / 20)];
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
    }, 150);
}

// Global helper functions
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

function quickCommand(command) {
    if (soulCommanderGame) {
        document.getElementById('commandInput').value = command;
        executeCommand();
    }
}

function useEquipment(slot) {
    if (soulCommanderGame) {
        const messages = {
            weapon: "⚔️ Preparing weapon...",
            skill: "💥 Charging skill...",
            armor: "🛡️ Checking armor...",
            accessory: "💎 Activating artifact...",
            potion: soulCommanderGame.player.equipment.potion.count > 0 ? 
                    soulCommanderGame.usePotion() : 
                    "❌ No potions left!",
            special: "🐉 Companion is active!"
        };
        
        soulCommanderGame.addLog(messages[slot], "system");
        
        if (slot === 'potion' && soulCommanderGame.player.equipment.potion.count > 0) {
            // usePotion() is called in the message above
        }
    }
}

function clearGameLog() {
    if (soulCommanderGame) {
        soulCommanderGame.clearLog();
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

function toggleTheme() {
    if (soulCommanderGame) {
        soulCommanderGame.toggleTheme();
    }
}

function toggleAutoScroll() {
    if (soulCommanderGame) {
        soulCommanderGame.toggleAutoScroll();
    }
}

function scrollLogToTop() {
    if (soulCommanderGame) {
        soulCommanderGame.scrollLogToTop();
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
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// Modal functions
function showMobileTips() {
    const modal = document.getElementById('mobileTipsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showKeyboardHelp() {
    alert("Keyboard Shortcuts:\n\n↑/↓ - Command history\nTab - Auto-complete\nEnter - Execute command\nEsc - Blur input");
}

function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: 'Soul Commander',
            text: 'Check out this awesome pixel command RPG game!',
            url: window.location.href
        });
    } else {
        alert('Share URL: ' + window.location.href);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initSoulCommander);

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(console.error);
    });
}

// Export for debugging
window.soulCommander = soulCommanderGame;
window.game = soulCommanderGame;

// ===== FULLSCREEN SCROLL MANAGER =====
// Paste di BAWAH SEMUA code JavaScript, sebelum </script>

function setupScrollFix() {
    const container = document.querySelector('.game-container');
    if (!container) return;
    
    // 1. Force scrollable di mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        container.classList.add('scrollable');
        container.style.overflowY = 'auto';
        document.body.style.overflowY = 'auto';
    }
    
    // 2. Handle fullscreen changes
    const fullscreenEvents = [
        'fullscreenchange',
        'webkitfullscreenchange',
        'mozfullscreenchange',
        'MSFullscreenChange'
    ];
    
    fullscreenEvents.forEach(event => {
        document.addEventListener(event, () => {
            setTimeout(() => {
                const isFullscreen = !!(document.fullscreenElement || 
                                       document.webkitFullscreenElement ||
                                       document.mozFullScreenElement ||
                                       document.msFullscreenElement);
                
                if (isFullscreen) {
                    // Fullscreen: enable scroll
                    container.style.overflowY = 'auto';
                    container.style.height = '100vh';
                    document.body.style.overflow = 'auto';
                } else {
                    // Normal: tetap scrollable terutama di mobile
                    if (/Mobi|Android/i.test(navigator.userAgent)) {
                        container.style.overflowY = 'auto';
                    }
                }
            }, 100);
        });
    });
    
    // 3. Force scrollable setelah load
    setTimeout(() => {
        container.style.overflowY = 'auto';
    }, 2000);
}

// Panggil fungsi ini di init()
setupScrollFix();