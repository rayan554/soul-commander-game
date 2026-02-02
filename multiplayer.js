// ============================================
// SOUL COMMANDER - MULTIPLAYER SYSTEM
// Lightweight online features for mobile
// ============================================

class SoulCommanderMultiplayer {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.socket = null;
        this.connected = false;
        this.players = new Map();
        this.room = null;
        
        // Configuration
        this.config = {
            serverUrl: 'wss://soul-commander-server.glitch.me',
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            heartbeatInterval: 30000
        };
        
        this.reconnectAttempts = 0;
        this.heartbeatInterval = null;
    }
    
    connect() {
        if (this.connected || !navigator.onLine) {
            return;
        }
        
        try {
            // For demo purposes, we'll simulate connection
            // In production, use WebSocket connection
            
            this.simulateConnection();
            
            // Uncomment for real WebSocket connection:
            /*
            this.socket = new WebSocket(this.config.serverUrl);
            
            this.socket.onopen = () => this.onConnect();
            this.socket.onmessage = (event) => this.onMessage(event);
            this.socket.onclose = () => this.onDisconnect();
            this.socket.onerror = (error) => this.onError(error);
            */
            
        } catch (error) {
            console.error('Connection error:', error);
            this.scheduleReconnect();
        }
    }
    
    simulateConnection() {
        // Simulate connection for demo
        setTimeout(() => {
            this.connected = true;
            this.onConnect();
            
            // Update player count periodically
            this.simulatePlayerCount();
            
            // Send heartbeat
            this.startHeartbeat();
        }, 1000);
    }
    
    onConnect() {
        console.log('Connected to multiplayer server');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Update UI
        this.game.updateConnectionStatus(true);
        this.game.addLog('🌐 Connected to Soul Network', 'system');
        
        // Send player info
        this.sendPlayerInfo();
    }
    
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        } catch (error) {
            console.error('Message parsing error:', error);
        }
    }
    
    handleMessage(data) {
        switch(data.type) {
            case 'player_joined':
                this.handlePlayerJoined(data);
                break;
            case 'player_left':
                this.handlePlayerLeft(data);
                break;
            case 'player_update':
                this.handlePlayerUpdate(data);
                break;
            case 'room_info':
                this.handleRoomInfo(data);
                break;
            case 'global_message':
                this.handleGlobalMessage(data);
                break;
        }
    }
    
    handlePlayerJoined(data) {
        this.players.set(data.playerId, data.player);
        this.updatePlayerCount();
        
        if (data.playerId !== this.getPlayerId()) {
            this.game.addLog(`👤 ${data.player.name} joined the realm`, 'system');
        }
    }
    
    handlePlayerLeft(data) {
        this.players.delete(data.playerId);
        this.updatePlayerCount();
        
        this.game.addLog(`👤 ${data.playerName} left the realm`, 'system');
    }
    
    handlePlayerUpdate(data) {
        // Update player info
        if (this.players.has(data.playerId)) {
            this.players.set(data.playerId, {
                ...this.players.get(data.playerId),
                ...data.player
            });
        }
    }
    
    handleRoomInfo(data) {
        this.room = data.room;
        this.updatePlayerCount();
    }
    
    handleGlobalMessage(data) {
        this.game.addLog(`🌐 ${data.message}`, 'system');
    }
    
    onDisconnect() {
        console.log('Disconnected from server');
        this.connected = false;
        this.players.clear();
        
        // Update UI
        this.game.updateConnectionStatus(false);
        this.game.addLog('🌐 Disconnected from Soul Network', 'system');
        
        // Stop heartbeat
        this.stopHeartbeat();
        
        // Try to reconnect
        this.scheduleReconnect();
    }
    
    onError(error) {
        console.error('WebSocket error:', error);
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        
        setTimeout(() => {
            if (!this.connected) {
                this.connect();
            }
        }, this.config.reconnectInterval);
    }
    
    startHeartbeat() {
        this.stopHeartbeat();
        
        this.heartbeatInterval = setInterval(() => {
            if (this.connected) {
                this.sendHeartbeat();
            }
        }, this.config.heartbeatInterval);
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    sendHeartbeat() {
        this.send({
            type: 'heartbeat',
            timestamp: Date.now(),
            playerId: this.getPlayerId()
        });
    }
    
    sendPlayerInfo() {
        this.send({
            type: 'player_join',
            player: {
                id: this.getPlayerId(),
                name: this.game.player.name,
                level: this.game.player.level,
                class: this.game.player.class,
                location: this.game.player.location
            },
            timestamp: Date.now()
        });
    }
    
    sendPlayerUpdate() {
        if (!this.connected) return;
        
        this.send({
            type: 'player_update',
            playerId: this.getPlayerId(),
            player: {
                level: this.game.player.level,
                location: this.game.player.location,
                health: this.game.player.health,
                maxHealth: this.game.player.maxHealth
            },
            timestamp: Date.now()
        });
    }
    
    sendGlobalAchievement(achievement) {
        this.send({
            type: 'achievement',
            playerId: this.getPlayerId(),
            playerName: this.game.player.name,
            achievement: achievement,
            timestamp: Date.now()
        });
    }
    
    send(data) {
        if (!this.connected || !this.socket) return;
        
        try {
            this.socket.send(JSON.stringify(data));
        } catch (error) {
            console.error('Send error:', error);
        }
    }
    
    getPlayerId() {
        // Generate or retrieve player ID
        let playerId = localStorage.getItem('soul_commander_player_id');
        
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('soul_commander_player_id', playerId);
        }
        
        return playerId;
    }
    
    updatePlayerCount() {
        const playerCount = this.players.size + 1; // +1 for current player
        const countElement = document.getElementById('playerCount');
        
        if (countElement) {
            countElement.textContent = playerCount;
        }
    }
    
    simulatePlayerCount() {
        // Simulate random player count for demo
        setInterval(() => {
            if (this.connected) {
                const randomCount = Math.floor(Math.random() * 50) + 10;
                const countElement = document.getElementById('playerCount');
                
                if (countElement) {
                    countElement.textContent = randomCount;
                }
            }
        }, 10000);
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        
        this.stopHeartbeat();
        this.connected = false;
        this.players.clear();
    }
}

// Export multiplayer system
window.SoulCommanderMultiplayer = SoulCommanderMultiplayer;