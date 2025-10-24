class MessagingSystem {
    constructor() {
        this.messages = [];
        this.notifications = [];
        this.staff = [];
        this.currentUser = null; // Will be set from session
        this.selectedThread = null;
        this.selectedRecipients = [];
        this.filterMode = 'all';
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderMessageThreads();
            this.renderNotifications();
            this.populateRecipientSelection();
            this.updateNotificationBadge();
            this.setupEventListeners();
            this.startAutoRefresh();
            
            // Check if there's a pre-selected recipient from another page
            this.checkPreSelectedRecipient();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to load messaging system', 'error');
        }
    }

    checkPreSelectedRecipient() {
        const recipientId = sessionStorage.getItem('messageRecipient');
        if (recipientId) {
            // Clear from session storage
            sessionStorage.removeItem('messageRecipient');
            
            // Open compose modal with pre-selected recipient
            setTimeout(() => {
                this.selectedRecipients = [recipientId];
                this.renderSelectedRecipients();
                
                // Check the checkbox
                const checkbox = document.querySelector(`input[value="${recipientId}"]`);
                if (checkbox) checkbox.checked = true;
                
                // Open modal
                document.getElementById('composeModal').classList.remove('hidden');
                
                // Show notification
                const staff = this.staff.find(s => s.id === recipientId);
                if (staff) {
                    this.showNotification(`Composing message to ${staff.name}`, 'info');
                }
            }, 500);
        }
    }

    async loadData() {
        try {
            // Load staff members
            const staffResponse = await fetch('tables/staff_members');
            if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                this.staff = staffData.data || [];
            }

            // Load messages
            const messagesResponse = await fetch('tables/messages');
            if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                this.messages = messagesData.data || [];
            }

            // Load notifications
            const notificationsResponse = await fetch('tables/notifications');
            if (notificationsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                this.notifications = notificationsData.data || [];
            }

            // Set current user from session storage
            try {
                const sessionUser = sessionStorage.getItem('itrusty_user');
                if (sessionUser) {
                    const userData = JSON.parse(sessionUser);
                    console.log('📝 Session user data:', userData);
                    
                    // Try to find staff member using staff_member_id from user data
                    let currentStaff = null;
                    
                    if (userData.staff_member_id) {
                        currentStaff = this.staff.find(s => s.id === userData.staff_member_id);
                        if (currentStaff) {
                            console.log('✅ Found staff via staff_member_id:', currentStaff.name);
                        }
                    }
                    
                    // If not found, try matching by username
                    if (!currentStaff && userData.username) {
                        // Fetch users table to find staff_member_id
                        const usersResponse = await fetch('tables/users');
                        if (usersResponse.ok) {
                            const usersData = await usersResponse.json();
                            const matchedUser = usersData.data.find(u => 
                                u.username === userData.username || 
                                u.email === userData.email ||
                                u.id === userData.user_id
                            );
                            if (matchedUser && matchedUser.staff_member_id) {
                                currentStaff = this.staff.find(s => s.id === matchedUser.staff_member_id);
                                if (currentStaff) {
                                    console.log('✅ Found staff via users table:', currentStaff.name);
                                }
                            }
                        }
                    }
                    
                    // If STILL not found, try direct username to staff name matching
                    if (!currentStaff && userData.username) {
                        // Try case-insensitive name match
                        const username = userData.username.toLowerCase();
                        currentStaff = this.staff.find(s => {
                            if (!s.name) return false;
                            const staffName = s.name.toLowerCase();
                            return staffName === username || 
                                   staffName.includes(username) ||
                                   staffName.split(' ')[0] === username; // First name match
                        });
                        if (currentStaff) {
                            console.log('✅ Found staff via username-to-name match:', currentStaff.name);
                            console.log('   Matched username:', userData.username, '→ Staff name:', currentStaff.name);
                        }
                    }
                    
                    // If found, set current user
                    if (currentStaff) {
                        this.currentUser = currentStaff.id;
                        console.log('✅ Current user set:', currentStaff.name, '(Staff ID:', currentStaff.id, ')');
                    } else {
                        console.warn('⚠️ Logged-in user not found in staff members.');
                        console.warn('   Username:', userData.username);
                        console.warn('   Email:', userData.email);
                        console.warn('   Staff Member ID:', userData.staff_member_id);
                        // Fallback to first staff member
                        if (this.staff.length > 0) {
                            this.currentUser = this.staff[0].id;
                            console.warn('⚠️ Using fallback user:', this.staff[0].name);
                        }
                    }
                } else {
                    console.warn('⚠️ No session user found. Using first staff member.');
                    // Fallback to first staff member
                    if (this.staff.length > 0) {
                        this.currentUser = this.staff[0].id;
                    }
                }
            } catch (error) {
                console.error('❌ Error getting current user:', error);
                // Fallback to first staff member
                if (this.staff.length > 0) {
                    this.currentUser = this.staff[0].id;
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    renderMessageThreads() {
        const container = document.getElementById('messageThreads');
        
        // Group messages by thread_id
        const threads = this.groupMessagesByThread();
        
        // Filter based on current filter mode
        let filteredThreads = threads;
        if (this.filterMode === 'unread') {
            filteredThreads = threads.filter(thread => !this.isThreadRead(thread));
        }

        // Update counts
        document.getElementById('countAll').textContent = `(${threads.length})`;
        document.getElementById('countUnread').textContent = `(${threads.filter(t => !this.isThreadRead(t)).length})`;

        if (filteredThreads.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-3xl mb-2"></i>
                    <p>No messages</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredThreads.map(thread => {
            const lastMessage = thread.messages[thread.messages.length - 1];
            const sender = this.staff.find(s => s.id === lastMessage.from_staff_id);
            const isUnread = !this.isThreadRead(thread);
            const timestamp = this.getRelativeTime(lastMessage.sent_at || lastMessage.created_at);
            
            return `
                <div class="message-thread p-4 cursor-pointer ${isUnread ? 'unread' : ''}" 
                     onclick="selectThread('${thread.thread_id}')">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full ${this.getAvatarColor(sender?.name || 'Unknown')} flex items-center justify-center text-white font-semibold">
                            ${this.getInitials(sender?.name || 'U')}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-1">
                                <h4 class="font-semibold text-sm truncate ${isUnread ? 'text-blue-600' : ''}">${lastMessage.subject}</h4>
                                <span class="text-xs text-gray-500 ml-2">${timestamp}</span>
                            </div>
                            <p class="text-sm text-gray-600 mb-1">${sender?.name || 'Unknown'}</p>
                            <p class="text-sm text-gray-500 truncate">${this.stripHtml(lastMessage.message_body)}</p>
                            <div class="flex items-center gap-2 mt-2">
                                ${this.getPriorityBadge(lastMessage.priority)}
                                ${this.getTypeBadge(lastMessage.message_type)}
                                ${thread.messages.length > 1 ? `<span class="text-xs text-gray-500"><i class="fas fa-reply"></i> ${thread.messages.length}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    groupMessagesByThread() {
        const threadMap = new Map();
        
        this.messages.forEach(message => {
            const threadId = message.thread_id || message.id;
            if (!threadMap.has(threadId)) {
                threadMap.set(threadId, {
                    thread_id: threadId,
                    messages: []
                });
            }
            threadMap.get(threadId).messages.push(message);
        });

        // Sort threads by last message time
        return Array.from(threadMap.values()).sort((a, b) => {
            const aTime = a.messages[a.messages.length - 1].sent_at || a.messages[a.messages.length - 1].created_at;
            const bTime = b.messages[b.messages.length - 1].sent_at || b.messages[b.messages.length - 1].created_at;
            return bTime - aTime;
        });
    }

    isThreadRead(thread) {
        const lastMessage = thread.messages[thread.messages.length - 1];
        if (lastMessage.from_staff_id === this.currentUser) return true;
        return lastMessage.read_by && lastMessage.read_by.includes(this.currentUser);
    }

    selectThread(threadId) {
        this.selectedThread = threadId;
        const thread = this.groupMessagesByThread().find(t => t.thread_id === threadId);
        
        if (!thread) return;

        // Mark as read
        this.markThreadAsRead(thread);

        // Render messages
        this.renderConversation(thread);
        
        // Show message input
        document.getElementById('messageInputArea').classList.remove('hidden');
        document.getElementById('conversationInfo').classList.remove('hidden');
        
        // Show participants
        this.renderParticipants(thread);
    }

    renderConversation(thread) {
        const headerContainer = document.getElementById('messageHeader');
        const messagesContainer = document.getElementById('messagesContainer');
        
        const firstMessage = thread.messages[0];
        const participants = this.getThreadParticipants(thread);
        
        // Render header
        headerContainer.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold text-lg">${firstMessage.subject}</h3>
                    <p class="text-sm text-gray-500">${participants.map(p => p.name).join(', ')}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="archiveThread('${thread.thread_id}')" class="text-gray-600 hover:text-gray-800" title="Archive">
                        <i class="fas fa-archive"></i>
                    </button>
                    <button onclick="deleteThread('${thread.thread_id}')" class="text-gray-600 hover:text-gray-800" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Render messages
        messagesContainer.innerHTML = thread.messages.map(message => {
            const sender = this.staff.find(s => s.id === message.from_staff_id);
            const isMine = message.from_staff_id === this.currentUser;
            const timestamp = new Date(message.sent_at || message.created_at).toLocaleString();
            
            return `
                <div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-3">
                    <div class="message-bubble ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-4 shadow-sm max-w-md">
                        ${!isMine ? `<p class="font-semibold text-sm mb-1">${sender?.name || 'Unknown'}</p>` : ''}
                        <div class="message-text text-sm mb-2">${message.message_body}</div>
                        <div class="flex items-center justify-between gap-2 text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'}">
                            <span>${timestamp}</span>
                            ${message.message_type !== 'internal' ? `<span><i class="fas fa-paper-plane"></i> ${message.message_type}</span>` : ''}
                        </div>
                        <button onclick="openTranslationModal('${message.message_body.replace(/'/g, "\\'")}'); event.stopPropagation();" 
                                class="mt-2 text-xs ${isMine ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-800'} flex items-center gap-1">
                            <i class="fas fa-language"></i> Translate
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    getThreadParticipants(thread) {
        const participantIds = new Set();
        thread.messages.forEach(message => {
            participantIds.add(message.from_staff_id);
            if (message.to_staff_ids) {
                message.to_staff_ids.forEach(id => participantIds.add(id));
            }
        });
        
        return Array.from(participantIds)
            .map(id => this.staff.find(s => s.id === id))
            .filter(s => s);
    }

    renderParticipants(thread) {
        const participants = this.getThreadParticipants(thread);
        const container = document.getElementById('participantsList');
        
        container.innerHTML = participants.map(participant => `
            <div class="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div class="w-8 h-8 rounded-full ${this.getAvatarColor(participant.name)} flex items-center justify-center text-white text-sm font-semibold">
                    ${this.getInitials(participant.name)}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${participant.name}</p>
                    <p class="text-xs text-gray-500">${participant.office_location}</p>
                </div>
            </div>
        `).join('');
    }

    async markThreadAsRead(thread) {
        const lastMessage = thread.messages[thread.messages.length - 1];
        if (lastMessage.from_staff_id === this.currentUser) return;
        
        const readBy = lastMessage.read_by || [];
        if (!readBy.includes(this.currentUser)) {
            readBy.push(this.currentUser);
            
            try {
                await fetch(`tables/messages/${lastMessage.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        read_by: readBy,
                        status: 'read'
                    })
                });
                
                await this.loadData();
                this.renderMessageThreads();
                this.updateNotificationBadge();
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsPanel');
        
        // Filter notifications for current user
        const userNotifications = this.notifications
            .filter(n => n.staff_id === this.currentUser)
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, 20);

        if (userNotifications.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-3xl mb-2"></i>
                    <p class="text-sm">No notifications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = userNotifications.map(notification => {
            const isUnread = !notification.is_read;
            const timestamp = this.getRelativeTime(notification.created_at);
            
            return `
                <div class="p-3 ${isUnread ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer" 
                     onclick="openNotification('${notification.id}')">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full ${this.getNotificationIconColor(notification.notification_type)} flex items-center justify-center text-white">
                            ${this.getNotificationIcon(notification.notification_type)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-1">
                                <h4 class="font-semibold text-sm ${isUnread ? 'text-blue-600' : ''}">${notification.title}</h4>
                                <span class="text-xs text-gray-500 ml-2">${timestamp}</span>
                            </div>
                            <p class="text-xs text-gray-600 line-clamp-2">${this.stripHtml(notification.content)}</p>
                            ${notification.action_label ? `
                            <button class="text-xs text-blue-600 hover:text-blue-700 mt-1">
                                ${notification.action_label} <i class="fas fa-arrow-right"></i>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => 
            n.staff_id === this.currentUser && !n.is_read
        ).length;
        
        const badge = document.getElementById('notificationBadge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    populateRecipientSelection() {
        const container = document.getElementById('recipientSelection');
        
        // Group by office
        const offices = [...new Set(this.staff.map(s => s.office_location))];
        
        container.innerHTML = offices.map(office => {
            const officeStaff = this.staff.filter(s => s.office_location === office);
            
            return `
                <div class="mb-3">
                    <h4 class="font-semibold text-sm text-gray-700 mb-2">${office}</h4>
                    ${officeStaff.map(staff => `
                        <label class="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input type="checkbox" value="${staff.id}" onchange="toggleRecipient('${staff.id}')" class="rounded">
                            <span class="text-sm">${staff.name} (${staff.role})</span>
                        </label>
                    `).join('')}
                </div>
            `;
        }).join('');
    }

    toggleRecipient(staffId) {
        const index = this.selectedRecipients.indexOf(staffId);
        if (index > -1) {
            this.selectedRecipients.splice(index, 1);
        } else {
            this.selectedRecipients.push(staffId);
        }
        this.renderSelectedRecipients();
    }

    renderSelectedRecipients() {
        const container = document.getElementById('selectedRecipients');
        
        container.innerHTML = this.selectedRecipients.map(staffId => {
            const staff = this.staff.find(s => s.id === staffId);
            return `
                <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    ${staff.name}
                    <button onclick="removeRecipient('${staffId}')" class="hover:text-blue-900">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </span>
            `;
        }).join('');
    }

    removeRecipient(staffId) {
        const index = this.selectedRecipients.indexOf(staffId);
        if (index > -1) {
            this.selectedRecipients.splice(index, 1);
        }
        // Uncheck the checkbox
        const checkbox = document.querySelector(`input[value="${staffId}"]`);
        if (checkbox) checkbox.checked = false;
        this.renderSelectedRecipients();
    }

    async sendMessage(formData) {
        if (this.selectedRecipients.length === 0) {
            this.showNotification('❌ Please select at least one recipient!', 'error');
            // Highlight the recipient selection area
            const recipientSection = document.getElementById('recipientSelection');
            if (recipientSection) {
                recipientSection.style.border = '2px solid red';
                setTimeout(() => {
                    recipientSection.style.border = '1px solid #d1d5db';
                }, 3000);
            }
            return;
        }

        // Validate subject and message
        const subject = formData.get('subject');
        const messageBody = formData.get('message_body');
        
        if (!subject || subject.trim().length === 0) {
            this.showNotification('❌ Please enter a subject!', 'error');
            return;
        }
        
        if (!messageBody || messageBody.trim().length === 0) {
            this.showNotification('❌ Please enter a message!', 'error');
            return;
        }

        console.log(`✅ Sending to ${this.selectedRecipients.length} recipients:`, this.selectedRecipients);

        const messageData = {
            from_staff_id: this.currentUser,
            to_staff_ids: this.selectedRecipients,
            subject: formData.get('subject'),
            message_body: formData.get('message_body'),
            message_type: formData.get('message_type'),
            priority: formData.get('priority'),
            status: 'sent',
            read_by: [],
            attachments: window.attachedFiles || [], // Include attached files
            thread_id: null, // Will be set to message ID after creation
            sent_at: Date.now(),
            metadata: JSON.stringify({
                category: document.getElementById('messageCategory').value,
                related_order: document.getElementById('relatedOrder').value,
                related_customer: document.getElementById('relatedCustomer').value
            })
        };

        try {
            console.log('📤 Sending message:', messageData);
            
            const response = await fetch('tables/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            console.log('📥 Response status:', response.status);

            if (response.ok) {
                const createdMessage = await response.json();
                console.log('✅ Message created:', createdMessage);
                
                // Update thread_id to self if not a reply
                await fetch(`tables/messages/${createdMessage.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ thread_id: createdMessage.id })
                });

                // Create notifications for recipients
                await this.createNotificationsForMessage(createdMessage);

                this.showNotification('Message sent successfully! ✅', 'success');
                
                // Clear attached files after successful send
                window.attachedFiles = [];
                
                closeComposeModal(); // Call global function
                await this.loadData();
                this.renderMessageThreads();
            } else {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
                throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.showNotification(`Failed to send message: ${error.message}`, 'error');
        }
    }

    async createNotificationsForMessage(message) {
        const sender = this.staff.find(s => s.id === message.from_staff_id);
        
        for (const recipientId of message.to_staff_ids) {
            const notificationData = {
                staff_id: recipientId,
                notification_type: 'message',
                title: `New message from ${sender.name}`,
                content: `${message.subject} - ${this.stripHtml(message.message_body).substring(0, 100)}...`,
                priority: message.priority,
                is_read: false,
                is_archived: false,
                action_url: 'messaging.html',
                action_label: 'View Message',
                related_entity_id: message.id,
                related_entity_type: 'message',
                sent_via: message.message_type,
                metadata: JSON.stringify({ thread_id: message.thread_id })
            };

            try {
                await fetch('tables/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notificationData)
                });
            } catch (error) {
                console.error('Error creating notification:', error);
            }
        }
    }

    async sendQuickReply(messageText) {
        if (!this.selectedThread || !messageText.trim()) return;

        const thread = this.groupMessagesByThread().find(t => t.thread_id === this.selectedThread);
        if (!thread) return;

        const firstMessage = thread.messages[0];
        const participants = this.getThreadParticipants(thread);
        const recipients = participants
            .filter(p => p.id !== this.currentUser)
            .map(p => p.id);

        const replyData = {
            from_staff_id: this.currentUser,
            to_staff_ids: recipients,
            subject: `Re: ${firstMessage.subject}`,
            message_body: messageText,
            message_type: 'internal',
            priority: firstMessage.priority || 'normal',
            status: 'sent',
            read_by: [],
            attachments: [],
            reply_to: thread.messages[thread.messages.length - 1].id,
            thread_id: this.selectedThread,
            sent_at: Date.now(),
            metadata: '{}'
        };

        try {
            const response = await fetch('tables/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(replyData)
            });

            if (response.ok) {
                const createdMessage = await response.json();
                await this.createNotificationsForMessage(createdMessage);
                
                document.getElementById('quickReplyInput').value = '';
                await this.loadData();
                this.selectThread(this.selectedThread);
            } else {
                throw new Error('Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            this.showNotification('Failed to send reply', 'error');
        }
    }

    setupEventListeners() {
        // Compose form submission
        document.getElementById('composeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await this.sendMessage(formData);
        });

        // Quick reply form
        document.getElementById('quickReplyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('quickReplyInput');
            await this.sendQuickReply(input.value);
        });

        // Staff search
        const staffSearch = document.getElementById('staffSearch');
        if (staffSearch) {
            staffSearch.addEventListener('input', (e) => {
                this.filterStaffCards(e.target.value);
            });
        }
    }

    startAutoRefresh() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadData().then(() => {
                this.renderMessageThreads();
                this.renderNotifications();
                this.updateNotificationBadge();
            });
        }, 30000);
    }

    // Utility functions
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getAvatarColor(name) {
        const colors = [
            'bg-blue-600', 'bg-green-600', 'bg-purple-600', 
            'bg-pink-600', 'bg-indigo-600', 'bg-orange-600', 
            'bg-teal-600', 'bg-red-600'
        ];
        return colors[name.length % colors.length];
    }

    getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    getPriorityBadge(priority) {
        const badges = {
            urgent: '<span class="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">Urgent</span>',
            high: '<span class="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded">High</span>',
            normal: '',
            low: '<span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Low</span>'
        };
        return badges[priority] || '';
    }

    getTypeBadge(type) {
        const badges = {
            email: '<span class="text-xs text-blue-600"><i class="fas fa-envelope"></i></span>',
            wechat: '<span class="text-xs text-green-600"><i class="fab fa-weixin"></i></span>',
            internal: ''
        };
        return badges[type] || '';
    }

    getNotificationIcon(type) {
        const icons = {
            message: '<i class="fas fa-comment text-xs"></i>',
            task: '<i class="fas fa-tasks text-xs"></i>',
            payment: '<i class="fas fa-dollar-sign text-xs"></i>',
            order: '<i class="fas fa-box text-xs"></i>',
            system: '<i class="fas fa-cog text-xs"></i>',
            reminder: '<i class="fas fa-bell text-xs"></i>'
        };
        return icons[type] || '<i class="fas fa-info text-xs"></i>';
    }

    getNotificationIconColor(type) {
        const colors = {
            message: 'bg-blue-500',
            task: 'bg-purple-500',
            payment: 'bg-green-500',
            order: 'bg-orange-500',
            system: 'bg-gray-500',
            reminder: 'bg-yellow-500'
        };
        return colors[type] || 'bg-gray-500';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions
function filterMessages(mode) {
    if (window.messagingSystem) {
        window.messagingSystem.filterMode = mode;
        
        // Update button styles
        document.querySelectorAll('[id^="filter"]').forEach(btn => {
            btn.classList.remove('border-blue-600', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-600');
        });
        
        const activeBtn = document.getElementById('filter' + mode.charAt(0).toUpperCase() + mode.slice(1));
        if (activeBtn) {
            activeBtn.classList.remove('border-transparent', 'text-gray-600');
            activeBtn.classList.add('border-blue-600', 'text-blue-600');
        }
        
        window.messagingSystem.renderMessageThreads();
    }
}

function selectThread(threadId) {
    if (window.messagingSystem) {
        window.messagingSystem.selectThread(threadId);
    }
}

function toggleRecipient(staffId) {
    if (window.messagingSystem) {
        window.messagingSystem.toggleRecipient(staffId);
    }
}

function removeRecipient(staffId) {
    if (window.messagingSystem) {
        window.messagingSystem.removeRecipient(staffId);
    }
}

function openComposeModal() {
    if (window.messagingSystem) {
        window.messagingSystem.selectedRecipients = [];
        window.messagingSystem.renderSelectedRecipients();
        document.getElementById('composeForm').reset();
    }
    document.getElementById('composeModal').classList.remove('hidden');
}

function closeComposeModal() {
    document.getElementById('composeModal').classList.add('hidden');
    // Reset form and selected recipients
    if (window.messagingSystem) {
        window.messagingSystem.selectedRecipients = [];
        window.messagingSystem.renderSelectedRecipients();
        document.getElementById('composeForm').reset();
        // Uncheck all checkboxes
        document.querySelectorAll('#recipientSelection input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }
}

function openStaffDirectory() {
    if (window.messagingSystem) {
        renderStaffDirectory();
    }
    document.getElementById('staffDirectoryModal').classList.remove('hidden');
}

function closeStaffDirectory() {
    document.getElementById('staffDirectoryModal').classList.add('hidden');
}

function renderStaffDirectory() {
    if (!window.messagingSystem) return;
    
    const container = document.getElementById('staffCardsGrid');
    container.innerHTML = window.messagingSystem.staff.map(staff => `
        <div class="staff-card bg-white border rounded-lg p-4 shadow-sm" onclick="messageStaff('${staff.id}')">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full ${window.messagingSystem.getAvatarColor(staff.name)} flex items-center justify-center text-white font-semibold">
                    ${window.messagingSystem.getInitials(staff.name)}
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold">${staff.name}</h4>
                    <p class="text-sm text-gray-600">${staff.role}</p>
                </div>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
                <div><i class="fas fa-building w-4"></i> ${staff.office_location}</div>
                ${staff.email ? `<div><i class="fas fa-envelope w-4"></i> ${staff.email}</div>` : ''}
                ${staff.wechat_id ? `<div><i class="fab fa-weixin w-4"></i> ${staff.wechat_id}</div>` : ''}
            </div>
            <button class="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
                <i class="fas fa-paper-plane mr-1"></i> Send Message
            </button>
        </div>
    `).join('');
}

function messageStaff(staffId) {
    closeStaffDirectory();
    openComposeModal();
    
    if (window.messagingSystem) {
        window.messagingSystem.selectedRecipients = [staffId];
        window.messagingSystem.renderSelectedRecipients();
        
        // Check the checkbox
        const checkbox = document.querySelector(`input[value="${staffId}"]`);
        if (checkbox) checkbox.checked = true;
    }
}

function filterStaffByOffice(office) {
    // Update button styles
    document.querySelectorAll('#staffDirectoryModal button[onclick^="filterStaffByOffice"]').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    event.target.classList.add('bg-blue-600', 'text-white');
    
    // Filter cards
    const cards = document.querySelectorAll('.staff-card');
    cards.forEach(card => {
        if (office === 'all' || card.textContent.includes(office)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function toggleNotifications() {
    // In a real implementation, this would show/hide a notifications panel
    console.log('Toggle notifications panel');
}

function markAllAsRead() {
    if (window.messagingSystem) {
        console.log('Mark all notifications as read');
        window.messagingSystem.showNotification('All notifications marked as read', 'success');
    }
}

function openNotification(notificationId) {
    if (window.messagingSystem) {
        const notification = window.messagingSystem.notifications.find(n => n.id === notificationId);
        if (notification && notification.action_url) {
            // Mark as read
            fetch(`tables/notifications/${notificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: true, read_at: Date.now() })
            });
            
            // Navigate to action URL if provided
            if (notification.related_entity_type === 'message') {
                window.messagingSystem.loadData().then(() => {
                    window.messagingSystem.renderNotifications();
                    window.messagingSystem.updateNotificationBadge();
                });
            }
        }
    }
}

function archiveThread(threadId) {
    console.log('Archive thread:', threadId);
    if (window.messagingSystem) {
        window.messagingSystem.showNotification('Thread archived', 'success');
    }
}

function deleteThread(threadId) {
    if (confirm('Are you sure you want to delete this conversation?')) {
        console.log('Delete thread:', threadId);
        if (window.messagingSystem) {
            window.messagingSystem.showNotification('Thread deleted', 'success');
        }
    }
}

function refreshMessages() {
    if (window.messagingSystem) {
        window.messagingSystem.loadData().then(() => {
            window.messagingSystem.renderMessageThreads();
            window.messagingSystem.renderNotifications();
            window.messagingSystem.updateNotificationBadge();
            window.messagingSystem.showNotification('Messages refreshed', 'success');
        });
    }
}

function openBroadcast() {
    openComposeModal();
    if (window.messagingSystem) {
        // Select all staff
        window.messagingSystem.selectedRecipients = window.messagingSystem.staff.map(s => s.id);
        window.messagingSystem.renderSelectedRecipients();
        
        // Check all checkboxes
        document.querySelectorAll('#recipientSelection input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        
        document.getElementById('messageSubject').value = 'Important Announcement';
        document.getElementById('messagePriority').value = 'high';
    }
}

// ==========================================
// TRANSLATION FUNCTIONS
// ==========================================

let currentTranslationText = '';

function showTranslateButton(messageElement) {
    // Add translate button to message if not already there
    if (!messageElement.querySelector('.translate-btn')) {
        const translateBtn = document.createElement('button');
        translateBtn.className = 'translate-btn mt-2';
        translateBtn.innerHTML = '<i class="fas fa-language"></i> Translate';
        translateBtn.onclick = (e) => {
            e.stopPropagation();
            const messageText = messageElement.querySelector('.message-text')?.textContent || messageElement.textContent;
            openTranslationModal(messageText);
        };
        messageElement.appendChild(translateBtn);
    }
}

function openTranslationModal(text) {
    currentTranslationText = text;
    document.getElementById('originalText').textContent = text;
    document.getElementById('translationModal').classList.remove('hidden');
    document.getElementById('translatedTextContainer').classList.add('hidden');
}

function closeTranslationModal() {
    document.getElementById('translationModal').classList.add('hidden');
    currentTranslationText = '';
}

async function translateMessage(targetLang) {
    const loadingEl = document.getElementById('translationLoading');
    const resultEl = document.getElementById('translatedText');
    const containerEl = document.getElementById('translatedTextContainer');
    
    containerEl.classList.remove('hidden');
    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    
    try {
        let translatedText = null;
        
        // Method 1: Try Lingva Translate (CORS-friendly LibreTranslate frontend)
        try {
            console.log('🔄 Trying Lingva Translate...');
            // Detect source language first
            const detectResponse = await fetch(`https://lingva.ml/api/v1/auto/${targetLang}/${encodeURIComponent(currentTranslationText)}`);
            
            if (detectResponse.ok) {
                const data = await detectResponse.json();
                if (data && data.translation) {
                    translatedText = data.translation;
                    console.log('✅ Lingva Translate SUCCESS!');
                }
            }
        } catch (e) {
            console.log('❌ Lingva failed:', e.message);
        }
        
        // Method 2: Try Translate.com API (Simple REST API)
        if (!translatedText) {
            try {
                console.log('🔄 Trying Translate.com API...');
                const response = await fetch('https://api.translate.com/translate/v1/mt', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        source_language: 'auto',
                        target_language: targetLang,
                        text: currentTranslationText
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.translation) {
                        translatedText = data.translation;
                        console.log('✅ Translate.com SUCCESS!');
                    }
                }
            } catch (e) {
                console.log('❌ Translate.com failed:', e.message);
            }
        }
        
        // Method 3: Try MyMemory Translation API (Reliable free API)
        if (!translatedText) {
            try {
                console.log('🔄 Trying MyMemory API...');
                const langPair = `auto|${targetLang}`;
                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(currentTranslationText)}&langpair=${langPair}`, {
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
                        translatedText = data.responseData.translatedText;
                        console.log('✅ MyMemory SUCCESS!');
                    }
                }
            } catch (e) {
                console.log('❌ MyMemory failed:', e.message);
            }
        }
        
        // Method 4: Simple dictionary for common phrases (offline fallback)
        if (!translatedText) {
            console.log('🔄 Trying offline dictionary...');
            translatedText = getSimpleTranslation(currentTranslationText, targetLang);
            if (translatedText) {
                console.log('✅ Dictionary match found!');
            }
        }
        
        if (translatedText) {
            resultEl.textContent = translatedText;
            loadingEl.classList.add('hidden');
            resultEl.classList.remove('hidden');
        } else {
            throw new Error('All translation services unavailable');
        }
    } catch (error) {
        console.error('Translation error:', error);
        resultEl.innerHTML = `
            <div class="text-red-600">
                <p class="font-semibold mb-2">❌ Translation Temporarily Unavailable</p>
                <p class="text-sm mb-2">All translation services are currently unavailable.</p>
                <p class="text-sm text-gray-700 font-semibold mt-3 mb-1">💡 Quick Solutions:</p>
                <div class="bg-blue-50 p-2 rounded text-sm text-gray-700 mb-2">
                    <strong>Option 1:</strong> Copy text → Open <a href="https://translate.google.com" target="_blank" class="text-blue-600 underline">Google Translate</a> → Paste
                </div>
                <div class="bg-green-50 p-2 rounded text-sm text-gray-700">
                    <strong>Option 2:</strong> Ask team member (Lily/Ruby/Peng for Chinese, Nikos/Chrysanthi for Greek)
                </div>
            </div>
        `;
        loadingEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
    }
}

// Enhanced offline dictionary with I Trusty business phrases
function getSimpleTranslation(text, targetLang) {
    const dictionary = {
        // Basic greetings
        'hello': { en: 'Hello', zh: '你好', el: 'Γεια σου' },
        'hi': { en: 'Hi', zh: '嗨', el: 'Γεια' },
        'good morning': { en: 'Good morning', zh: '早上好', el: 'Καλημέρα' },
        'good afternoon': { en: 'Good afternoon', zh: '下午好', el: 'Καλό απόγευμα' },
        'good evening': { en: 'Good evening', zh: '晚上好', el: 'Καλησπέρα' },
        
        // Politeness
        'thank you': { en: 'Thank you', zh: '谢谢', el: 'Ευχαριστώ' },
        'please': { en: 'Please', zh: '请', el: 'Παρακαλώ' },
        'yes': { en: 'Yes', zh: '是', el: 'Ναι' },
        'no': { en: 'No', zh: '不', el: 'Όχι' },
        'ok': { en: 'OK', zh: '好的', el: 'Εντάξει' },
        'sorry': { en: 'Sorry', zh: '对不起', el: 'Συγγνώμη' },
        
        // Business phrases (I Trusty specific)
        'order confirmed': { en: 'Order confirmed', zh: '订单已确认', el: 'Η παραγγελία επιβεβαιώθηκε' },
        'shipment ready': { en: 'Shipment ready', zh: '货物已准备好', el: 'Η αποστολή είναι έτοιμη' },
        'quality check passed': { en: 'Quality check passed', zh: '质检通过', el: 'Ο ποιοτικός έλεγχος πέρασε' },
        'payment received': { en: 'Payment received', zh: '已收到付款', el: 'Η πληρωμή ελήφθη' },
        'urgent': { en: 'Urgent', zh: '紧急', el: 'Επείγον' },
        'delay': { en: 'Delay', zh: '延迟', el: 'Καθυστέρηση' },
        'price': { en: 'Price', zh: '价格', el: 'Τιμή' },
        'quantity': { en: 'Quantity', zh: '数量', el: 'Ποσότητα' },
        'sample': { en: 'Sample', zh: '样品', el: 'Δείγμα' },
        
        // Office locations
        'yiwu': { en: 'Yiwu', zh: '义乌', el: 'Γιγού' },
        'shenzhen': { en: 'Shenzhen', zh: '深圳', el: 'Σεντζέν' },
        
        // Common actions
        'confirm': { en: 'Confirm', zh: '确认', el: 'Επιβεβαίωση' },
        'cancel': { en: 'Cancel', zh: '取消', el: 'Ακύρωση' },
        'update': { en: 'Update', zh: '更新', el: 'Ενημέρωση' },
        'send': { en: 'Send', zh: '发送', el: 'Αποστολή' },
        'received': { en: 'Received', zh: '已收到', el: 'Παραλήφθηκε' },
        
        // Status terms
        'pending': { en: 'Pending', zh: '待处理', el: 'Εκκρεμεί' },
        'completed': { en: 'Completed', zh: '已完成', el: 'Ολοκληρώθηκε' },
        'in progress': { en: 'In progress', zh: '进行中', el: 'Σε εξέλιξη' },
        
        // Farewells
        'bye': { en: 'Bye', zh: '再见', el: 'Αντίο' },
        'see you': { en: 'See you', zh: '回头见', el: 'Τα λέμε' },
        'have a good day': { en: 'Have a good day', zh: '祝你愉快', el: 'Καλή μέρα' }
    };
    
    const lowerText = text.toLowerCase().trim();
    if (dictionary[lowerText] && dictionary[lowerText][targetLang]) {
        return dictionary[lowerText][targetLang];
    }
    
    return null;
}

// ==========================================
// MESSAGE TEMPLATES FUNCTIONS
// ==========================================

const defaultTemplates = [
    {
        id: 't1',
        category: 'order',
        title: 'Order Status Update',
        subject: 'Order #{order_number} Status Update',
        body: 'Dear Team,\n\nThis is to inform you that Order #{order_number} has been updated.\n\nNew Status: {status}\nExpected Delivery: {delivery_date}\n\nPlease coordinate accordingly.\n\nBest regards'
    },
    {
        id: 't2',
        category: 'customer',
        title: 'Customer Inquiry Response',
        subject: 'Re: Your Inquiry',
        body: 'Dear {customer_name},\n\nThank you for contacting I Trusty Ltd.\n\nWe have received your inquiry and our team is reviewing it. We will get back to you within 24 hours with a detailed response.\n\nIf you have any urgent questions, please don\'t hesitate to contact us directly.\n\nBest regards,\nI Trusty Team'
    },
    {
        id: 't3',
        category: 'order',
        title: 'Shipment Ready',
        subject: 'Shipment Ready - Order #{order_number}',
        body: 'Dear Team,\n\nGreat news! Order #{order_number} is ready for shipment.\n\nTracking Number: {tracking}\nExpected Departure: {date}\nDestination: {destination}\n\nPlease ensure all documentation is prepared.\n\nBest regards'
    },
    {
        id: 't4',
        category: 'general',
        title: 'Meeting Reminder',
        subject: 'Reminder: Meeting on {date}',
        body: 'Dear Team,\n\nThis is a reminder about our meeting scheduled for {date} at {time}.\n\nAgenda:\n1. {topic_1}\n2. {topic_2}\n3. {topic_3}\n\nPlease come prepared.\n\nSee you there!'
    },
    {
        id: 't5',
        category: 'customer',
        title: 'Payment Confirmation',
        subject: 'Payment Received - Invoice #{invoice_number}',
        body: 'Dear {customer_name},\n\nWe confirm receipt of your payment for Invoice #{invoice_number}.\n\nAmount: {amount}\nDate Received: {date}\n\nThank you for your prompt payment. Your order will proceed as scheduled.\n\nBest regards,\nI Trusty Accounting'
    },
    {
        id: 't6',
        category: 'order',
        title: 'Quality Issue Report',
        subject: 'Quality Concern - Order #{order_number}',
        body: 'Dear Team,\n\nA quality concern has been identified with Order #{order_number}.\n\nIssue: {issue_description}\nSeverity: {severity}\nAction Required: {action}\n\nPlease address this immediately and provide an update by end of day.\n\nRegards'
    }
];

function openTemplates() {
    document.getElementById('templatesModal').classList.remove('hidden');
    renderTemplatesList('all');
}

function closeTemplatesModal() {
    document.getElementById('templatesModal').classList.add('hidden');
}

function filterTemplates(category) {
    // Update button styles
    document.querySelectorAll('#templatesModal button[onclick^="filterTemplates"]').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    event.target.classList.add('bg-purple-600', 'text-white');
    
    renderTemplatesList(category);
}

function renderTemplatesList(category) {
    const templates = category === 'all' 
        ? defaultTemplates 
        : defaultTemplates.filter(t => t.category === category);
    
    const container = document.getElementById('templatesList');
    container.innerHTML = templates.map(template => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-400 transition cursor-pointer" onclick="useTemplate('${template.id}')">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold text-gray-900">${template.title}</h4>
                <span class="text-xs px-2 py-1 bg-${getCategoryColor(template.category)}-100 text-${getCategoryColor(template.category)}-700 rounded">
                    ${template.category}
                </span>
            </div>
            <p class="text-sm text-gray-600 mb-2"><strong>Subject:</strong> ${template.subject}</p>
            <p class="text-sm text-gray-500 line-clamp-2">${template.body.substring(0, 100)}...</p>
            <div class="mt-3 flex gap-2">
                <button onclick="event.stopPropagation(); useTemplate('${template.id}')" class="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                    <i class="fas fa-check"></i> Use Template
                </button>
                <button onclick="event.stopPropagation(); previewTemplate('${template.id}')" class="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                    <i class="fas fa-eye"></i> Preview
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryColor(category) {
    const colors = {
        order: 'blue',
        customer: 'green',
        general: 'gray'
    };
    return colors[category] || 'gray';
}

function useTemplate(templateId) {
    const template = defaultTemplates.find(t => t.id === templateId);
    if (template) {
        document.getElementById('messageSubject').value = template.subject;
        document.getElementById('messageBody').value = template.body;
        closeTemplatesModal();
        if (window.messagingSystem) {
            window.messagingSystem.showNotification('Template loaded! You can now customize it.', 'success');
        }
    }
}

function previewTemplate(templateId) {
    const template = defaultTemplates.find(t => t.id === templateId);
    if (template) {
        alert(`Template Preview\n\nSubject: ${template.subject}\n\n${template.body}`);
    }
}

function showCreateTemplateForm() {
    alert('Custom template creation will be available in the next update!');
}

function insertTemplate() {
    openTemplates();
}

// ==========================================
// FILE ATTACHMENT FUNCTIONS
// ==========================================

let attachedFiles = [];

function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif';
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        for (const file of files) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
                continue;
            }
            
            // Convert to base64
            const base64 = await fileToBase64(file);
            
            attachedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            });
        }
        
        renderAttachedFiles();
        if (window.messagingSystem) {
            window.messagingSystem.showNotification(`${files.length} file(s) attached`, 'success');
        }
    };
    
    input.click();
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderAttachedFiles() {
    // This would show attached files in the compose form
    // For now, we'll just log them
    console.log('Attached files:', attachedFiles);
}

function removeAttachment(index) {
    attachedFiles.splice(index, 1);
    renderAttachedFiles();
}

function saveAsDraft() {
    if (window.messagingSystem) {
        window.messagingSystem.showNotification('Draft saved! (Feature in development)', 'info');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.messagingSystem = new MessagingSystem();
});
