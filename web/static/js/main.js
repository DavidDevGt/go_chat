(() => {
    'use strict';
    
    // =============================================================================
    // CONFIGURATION & CONSTANTS
    // =============================================================================
    const CONFIG = {
        WS_URL: 'ws://localhost:8420/ws',
        RECONNECT_INTERVALS: [1000, 2000, 5000, 10000, 30000], // Exponential backoff
        MAX_RECONNECT_ATTEMPTS: 5,
        HEARTBEAT_INTERVAL: 30000,
        MESSAGE_TIMEOUT: 5000,
        STORAGE_KEY: 'chat_client_data',
        LOG_LEVEL: 'INFO' // DEBUG, INFO, WARN, ERROR
    };

    // =============================================================================
    // UTILITIES & HELPERS
    // =============================================================================
    const Logger = (() => {
        const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
        const currentLevel = levels[CONFIG.LOG_LEVEL] || levels.INFO;
        
        const formatMessage = (level, message, meta = {}) => ({
            timestamp: new Date().toISOString(),
            level,
            message,
            meta: { ...meta, clientId: State.clientId }
        });

        return {
            debug: (msg, meta) => currentLevel <= levels.DEBUG && console.debug('[DEBUG]', formatMessage('DEBUG', msg, meta)),
            info: (msg, meta) => currentLevel <= levels.INFO && console.info('[INFO]', formatMessage('INFO', msg, meta)),
            warn: (msg, meta) => currentLevel <= levels.WARN && console.warn('[WARN]', formatMessage('WARN', msg, meta)),
            error: (msg, meta) => currentLevel <= levels.ERROR && console.error('[ERROR]', formatMessage('ERROR', msg, meta))
        };
    })();

    const Metrics = (() => {
        const metrics = {
            connection_attempts: 0,
            successful_connections: 0,
            failed_connections: 0,
            messages_sent: 0,
            messages_received: 0,
            reconnections: 0,
            connection_duration: 0
        };

        return {
            increment: (metric) => {
                if (metrics.hasOwnProperty(metric)) {
                    metrics[metric]++;
                    Logger.debug(`Metric incremented: ${metric} = ${metrics[metric]}`);
                }
            },
            set: (metric, value) => {
                if (metrics.hasOwnProperty(metric)) {
                    metrics[metric] = value;
                    Logger.debug(`Metric set: ${metric} = ${value}`);
                }
            },
            get: (metric) => metrics[metric] || 0,
            getAll: () => ({ ...metrics })
        };
    })();

    const Utils = {
        $: (selector) => document.querySelector(selector),
        isNotEmpty: (value) => value && typeof value === 'string' && value.trim() !== '',
        debounce: (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(null, args), delay);
            };
        },
        sanitizeHTML: (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        generateId: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        validateMessage: (data) => {
            return data && 
                   typeof data === 'object' && 
                   Utils.isNotEmpty(data.user) && 
                   Utils.isNotEmpty(data.mensaje);
        }
    };

    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================
    const State = {
        clientId: null,
        ws: null,
        connectionState: 'DISCONNECTED', // DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING
        reconnectAttempts: 0,
        lastConnectedAt: null,
        heartbeatInterval: null,
        messageQueue: [], // For offline message queuing
        
        // Getters/Setters with validation
        setClientId(id) {
            if (Utils.isNotEmpty(id)) {
                this.clientId = id;
                this.persistState();
                Logger.info('Client ID set', { clientId: id });
                return true;
            }
            return false;
        },
        
        setConnectionState(state) {
            const validStates = ['DISCONNECTED', 'CONNECTING', 'CONNECTED', 'RECONNECTING'];
            if (validStates.includes(state)) {
                const previousState = this.connectionState;
                this.connectionState = state;
                Logger.info('Connection state changed', { from: previousState, to: state });
                EventBus.emit('connectionStateChanged', { from: previousState, to: state });
            }
        },
        
        persistState() {
            try {
                const stateData = {
                    clientId: this.clientId,
                    lastConnectedAt: this.lastConnectedAt
                };
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(stateData));
            } catch (error) {
                Logger.error('Failed to persist state', { error: error.message });
            }
        },
        
        loadState() {
            try {
                const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    this.clientId = data.clientId;
                    this.lastConnectedAt = data.lastConnectedAt;
                    Logger.info('State loaded from storage', { clientId: this.clientId });
                }
            } catch (error) {
                Logger.error('Failed to load state', { error: error.message });
            }
        }
    };

    // =============================================================================
    // EVENT BUS SYSTEM
    // =============================================================================
    const EventBus = (() => {
        const events = new Map();
        
        return {
            on(event, callback) {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event).push(callback);
            },
            
            emit(event, data) {
                if (events.has(event)) {
                    events.get(event).forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            Logger.error('EventBus callback error', { event, error: error.message });
                        }
                    });
                }
            },
            
            off(event, callback) {
                if (events.has(event)) {
                    const callbacks = events.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            }
        };
    })();

    // =============================================================================
    // WEBSOCKET MANAGER WITH RESILIENCE PATTERNS
    // =============================================================================
    const WebSocketManager = (() => {
        const connect = () => {
            if (State.connectionState === 'CONNECTING' || State.connectionState === 'CONNECTED') {
                Logger.warn('Connection attempt while already connecting/connected');
                return;
            }

            State.setConnectionState('CONNECTING');
            Metrics.increment('connection_attempts');
            
            const wsUrl = `${CONFIG.WS_URL}?id=${encodeURIComponent(State.clientId)}`;
            Logger.info('Attempting WebSocket connection', { url: wsUrl });
            
            try {
                State.ws = new WebSocket(wsUrl);
                setupWebSocketHandlers();
            } catch (error) {
                Logger.error('WebSocket creation failed', { error: error.message });
                handleConnectionError();
            }
        };

        const setupWebSocketHandlers = () => {
            const ws = State.ws;
            
            ws.addEventListener('open', () => {
                Logger.info('WebSocket connected successfully');
                State.setConnectionState('CONNECTED');
                State.reconnectAttempts = 0;
                State.lastConnectedAt = Date.now();
                Metrics.increment('successful_connections');
                
                startHeartbeat();
                processMessageQueue();
                EventBus.emit('connected');
            });

            ws.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Filter out heartbeat messages - don't show in chat
                    if (data.type === 'heartbeat') {
                        Logger.debug('Heartbeat received');
                        return;
                    }
                    
                    // Filter out system messages
                    if (data.type === 'system') {
                        Logger.debug('System message received', { data });
                        return;
                    }
                    
                    if (Utils.validateMessage(data)) {
                        Metrics.increment('messages_received');
                        EventBus.emit('messageReceived', data);
                        Logger.debug('Message received', { from: data.user });
                    } else {
                        Logger.warn('Invalid message format received', { data });
                    }
                } catch (error) {
                    Logger.error('Failed to parse message', { error: error.message, data: event.data });
                }
            });

            ws.addEventListener('error', (error) => {
                Logger.error('WebSocket error', { error: error.message });
                Metrics.increment('failed_connections');
                handleConnectionError();
            });

            ws.addEventListener('close', (event) => {
                Logger.info('WebSocket connection closed', { 
                    code: event.code, 
                    reason: event.reason,
                    wasClean: event.wasClean 
                });
                
                State.setConnectionState('DISCONNECTED');
                stopHeartbeat();
                
                if (event.code !== 1000) { // Not a normal closure
                    scheduleReconnect();
                }
            });
        };

        const handleConnectionError = () => {
            State.setConnectionState('DISCONNECTED');
            stopHeartbeat();
            scheduleReconnect();
        };

        const scheduleReconnect = () => {
            if (State.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
                Logger.error('Max reconnection attempts reached');
                EventBus.emit('maxReconnectAttemptsReached');
                return;
            }

            State.setConnectionState('RECONNECTING');
            const delay = CONFIG.RECONNECT_INTERVALS[Math.min(State.reconnectAttempts, CONFIG.RECONNECT_INTERVALS.length - 1)];
            State.reconnectAttempts++;
            
            Logger.info(`Scheduling reconnection attempt ${State.reconnectAttempts}`, { delay });
            Metrics.increment('reconnections');
            
            setTimeout(() => {
                if (State.connectionState === 'RECONNECTING') {
                    connect();
                }
            }, delay);
        };

        const startHeartbeat = () => {
            State.heartbeatInterval = setInterval(() => {
                if (State.ws && State.ws.readyState === WebSocket.OPEN) {
                    State.ws.send(JSON.stringify({ type: 'heartbeat' }));
                    Logger.debug('Heartbeat sent');
                }
            }, CONFIG.HEARTBEAT_INTERVAL);
        };

        const stopHeartbeat = () => {
            if (State.heartbeatInterval) {
                clearInterval(State.heartbeatInterval);
                State.heartbeatInterval = null;
            }
        };

        const processMessageQueue = () => {
            while (State.messageQueue.length > 0) {
                const message = State.messageQueue.shift();
                sendMessage(message);
            }
        };

        const sendMessage = (message) => {
            if (State.ws && State.ws.readyState === WebSocket.OPEN) {
                // Send regular chat messages as plain text (like original)
                State.ws.send(message);
                Metrics.increment('messages_sent');
                Logger.debug('Message sent', { message });
                return true;
            } else {
                Logger.warn('Cannot send message - WebSocket not connected, queuing message');
                State.messageQueue.push(message);
                return false;
            }
        };

        const disconnect = () => {
            Logger.info('Disconnecting WebSocket');
            State.setConnectionState('DISCONNECTED');
            stopHeartbeat();
            
            if (State.ws) {
                State.ws.close(1000, 'Client disconnect');
                State.ws = null;
            }
        };

        return {
            connect,
            disconnect,
            sendMessage,
            getConnectionState: () => State.connectionState
        };
    })();

    // =============================================================================
    // UI COMPONENTS
    // =============================================================================
    const UI = (() => {
        const elements = {
            modal: Utils.$('#usernameModal'),
            usernameInput: Utils.$('#usernameInput'),
            chat: Utils.$('#chat'),
            messageInput: Utils.$('#mensaje'),
            sendBtn: Utils.$('.send-btn'),
            usernameBtn: Utils.$('.modal-content button')
        };

        const toggleModal = (show) => {
            elements.modal.style.display = show ? 'flex' : 'none';
            if (show) {
                elements.usernameInput.focus();
                elements.usernameInput.classList.add('pulse-warning');
            } else {
                elements.usernameInput.classList.remove('pulse-warning');
            }
        };

        const showInputError = (element, message) => {
            element.classList.add('shake');
            element.title = message;
            setTimeout(() => {
                element.classList.remove('shake');
                element.title = '';
            }, 500);
        };

        const createMessageElement = ({ user, mensaje }) => {
            const isMine = user === State.clientId;
            const li = document.createElement('li');
            li.classList.add('message', isMine ? 'sent' : 'received');

            li.innerHTML = `
                <div class="bubble">
                    <div class="message-username">${Utils.sanitizeHTML(user)}</div>
                    <div class="message-content">${Utils.sanitizeHTML(mensaje)}</div>
                    <div class="message-time">${new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            `;
            return li;
        };

        const scrollToBottom = Utils.debounce(() => {
            elements.chat.scrollTop = elements.chat.scrollHeight;
        }, 100);

        const handleUsernameSubmit = () => {
            const username = elements.usernameInput.value.trim();
            if (Utils.isNotEmpty(username)) {
                if (State.setClientId(username)) {
                    toggleModal(false);
                    WebSocketManager.connect();
                } else {
                    showInputError(elements.usernameInput, 'Invalid username');
                }
            } else {
                showInputError(elements.usernameInput, 'Username cannot be empty');
            }
        };

        const handleMessageSubmit = () => {
            const mensaje = elements.messageInput.value.trim();
            if (Utils.isNotEmpty(mensaje)) {
                const success = WebSocketManager.sendMessage(mensaje);
                if (success) {
                    elements.messageInput.value = '';
                } else {
                    Logger.warn('Message queued for later delivery');
                    // Optionally show a visual indicator that message is queued
                }
            } else {
                showInputError(elements.messageInput, 'Message cannot be empty');
            }
        };

        const setupEventListeners = () => {
            // Username input handlers
            elements.usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUsernameSubmit();
                }
            });

            elements.usernameBtn.addEventListener('click', handleUsernameSubmit);

            // Message input handlers
            elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleMessageSubmit();
                }
            });

            elements.sendBtn.addEventListener('click', handleMessageSubmit);

            // EventBus listeners
            EventBus.on('messageReceived', (data) => {
                elements.chat.appendChild(createMessageElement(data));
                scrollToBottom();
            });

            EventBus.on('connectionStateChanged', ({ to }) => {
                // Update UI based on connection state
                const statusIndicator = Utils.$('.connection-status');
                if (statusIndicator) {
                    statusIndicator.textContent = to;
                    statusIndicator.className = `connection-status ${to.toLowerCase()}`;
                }
            });

            EventBus.on('maxReconnectAttemptsReached', () => {
                // Show user that connection failed and offer manual reconnect
                Logger.error('Connection failed - manual intervention required');
            });
        };

        return {
            init: () => {
                setupEventListeners();
                if (Utils.isNotEmpty(State.clientId)) {
                    toggleModal(false);
                    WebSocketManager.connect();
                } else {
                    toggleModal(true);
                }
            },
            toggleModal,
            showInputError
        };
    })();

    // =============================================================================
    // ERROR HANDLING & GLOBAL HANDLERS
    // =============================================================================
    const ErrorHandler = (() => {
        const handleUnhandledError = (error) => {
            Logger.error('Unhandled error', { 
                message: error.message, 
                stack: error.stack,
                type: error.constructor.name
            });
            
            // Could send to error tracking service here
            // ErrorTrackingService.reportError(error);
        };

        const init = () => {
            window.addEventListener('error', (event) => {
                handleUnhandledError(event.error);
            });

            window.addEventListener('unhandledrejection', (event) => {
                handleUnhandledError(event.reason);
            });

            // Graceful cleanup on page unload
            window.addEventListener('beforeunload', () => {
                Logger.info('Page unloading, disconnecting WebSocket');
                WebSocketManager.disconnect();
            });
        };

        return { init };
    })();

    // =============================================================================
    // APPLICATION INITIALIZATION
    // =============================================================================
    const App = (() => {
        const init = () => {
            Logger.info('Initializing Chat Application');
            
            // Load persisted state
            State.loadState();
            
            // Initialize error handling
            ErrorHandler.init();
            
            // Initialize UI
            UI.init();
            
            // Log startup metrics
            Logger.info('Application initialized', {
                clientId: State.clientId,
                config: CONFIG,
                metrics: Metrics.getAll()
            });
        };

        return { init };
    })();

    // =============================================================================
    // STARTUP
    // =============================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.init);
    } else {
        App.init();
    }

    // =============================================================================
    // DEVELOPMENT/DEBUG UTILITIES
    // =============================================================================
    if (CONFIG.LOG_LEVEL === 'DEBUG') {
        // Expose utilities for debugging
        window.ChatDebug = {
            state: State,
            metrics: Metrics,
            logger: Logger,
            websocket: WebSocketManager,
            eventBus: EventBus
        };
    }

    // Enviar mensajes en texto plano
    const originalSendMessage = WebSocketManager.sendMessage;
    WebSocketManager.sendMessage = function(message) {
        return originalSendMessage.call(WebSocketManager, message);
    };

    // Mostrar mensajes recibidos directamente
    EventBus.on('messageReceived', (data) => {
        const elements = {
            chat: document.querySelector('#chat')
        };
        elements.chat.appendChild(UI.createMessageElement(data));
        UI.scrollToBottom();
    });

})();