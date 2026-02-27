import { LightningElement, wire } from 'lwc';
import { 
    getWorkspaceApi, 
    IsConsoleNavigation, 
    getFocusedTabInfo, 
    setTabHighlighted,
    getAllTabInfo,
    setTabLabel,
    setTabIcon,
    openSubtab,
    disableTabClose,
    focusTab,
    refreshTab
} from 'lightning/platformWorkspaceApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class WorkspaceManager extends LightningElement {
    workspaceApi;
    error;
    focusedTabInfo;
    allTabsInfo = [];
    isHighlighted = false;
    selectedTabId;
    selectedParentTabId;
    newTabLabel = '';
    newTabIcon = 'standard:account';
    isTabCloseDisabled = false;
    isConsoleNavigation = false;

    @wire(IsConsoleNavigation)
    wiredIsConsoleNavigation({ error, data }) {
        if (data) {
            this.isConsoleNavigation = data;
            this.initializeWorkspaceApi();
        } else if (error) {
            this.error = error;
            this.showToast('Error', 'Failed to determine console navigation state', 'error');
        }
    }

    connectedCallback() {
        this.initializeWorkspaceApi();
    }

    async initializeWorkspaceApi() {
        try {
            this.workspaceApi = await getWorkspaceApi();
            if (this.isConsoleNavigation) {
                await this.loadTabInfo();
            }
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to initialize workspace API', 'error');
        }
    }

    async loadTabInfo() {
        try {
            this.focusedTabInfo = await getFocusedTabInfo();
            this.allTabsInfo = await getAllTabInfo();
            if (this.focusedTabInfo) {
                this.selectedTabId = this.focusedTabInfo.tabId;
            }
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to load tab information', 'error');
        }
    }

    // Basic Tab Operations
    async openTab() {
        if (!this.isConsoleNavigation) {
            this.showToast('Warning', 'This feature is only available in Console Navigation', 'warning');
            return;
        }

        try {
            if (this.workspaceApi) {
                const tabId = await this.workspaceApi.openTab({
                    pageReference: {
                        type: 'standard__objectPage',
                        attributes: {
                            objectApiName: 'Account',
                            actionName: 'list'
                        }
                    },
                    focus: true,
                    label: 'Account List View',
                    icon: 'standard:account'
                });
                
                await this.loadTabInfo();
                this.showToast('Success', 'Tab opened successfully', 'success');
            }
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to open tab', 'error');
        }
    }

    async closeTab() {
        if (!this.isConsoleNavigation) {
            this.showToast('Warning', 'This feature is only available in Console Navigation', 'warning');
            return;
        }

        try {
            if (this.workspaceApi && this.selectedTabId) {
                await this.workspaceApi.closeTab({
                    tabId: this.selectedTabId
                });
                await this.loadTabInfo();
                this.showToast('Success', 'Tab closed successfully', 'success');
            }
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to close tab', 'error');
        }
    }

    // Tab Highlighting
    async toggleHighlight() {
        if (!this.isConsoleNavigation || !this.selectedTabId) {
            this.showToast('Warning', 'No tab selected', 'warning');
            return;
        }

        try {
            this.isHighlighted = !this.isHighlighted;
            await setTabHighlighted(this.selectedTabId, this.isHighlighted, {
                pulse: true,
                state: 'success'
            });
            await this.loadTabInfo();
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to toggle highlight', 'error');
        }
    }

    // Tab Label and Icon Management
    async updateTabLabel() {
        if (!this.isConsoleNavigation || !this.selectedTabId) {
            this.showToast('Warning', 'No tab selected', 'warning');
            return;
        }

        try {
            const newLabel = this.newTabLabel || 'Updated Tab ' + new Date().toLocaleTimeString();
            await setTabLabel(this.selectedTabId, newLabel);
            await this.loadTabInfo();
            this.showToast('Success', 'Tab label updated', 'success');
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to update tab label', 'error');
        }
    }

    async updateTabIcon() {
        if (!this.isConsoleNavigation || !this.selectedTabId) {
            this.showToast('Warning', 'No tab selected', 'warning');
            return;
        }

        try {
            await setTabIcon(this.selectedTabId, this.newTabIcon, {
                iconAlt: 'Updated Icon'
            });
            await this.loadTabInfo();
            this.showToast('Success', 'Tab icon updated', 'success');
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to update tab icon', 'error');
        }
    }

    // Subtab Operations
    async openSubtab() {
        if (!this.isConsoleNavigation || !this.selectedParentTabId) {
            this.showToast('Warning', 'No parent tab selected', 'warning');
            return;
        }

        try {
            const subtabId = await openSubtab(this.selectedParentTabId, {
                pageReference: {
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'Contact',
                        actionName: 'list'
                    }
                },
                focus: true,
                label: 'Contact List View',
                icon: 'standard:contact'
            });
            
            await this.loadTabInfo();
            this.showToast('Success', 'Subtab opened successfully', 'success');
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to open subtab', 'error');
        }
    }

    // Tab Focus and Refresh
    async focusSelectedTab() {
        if (!this.isConsoleNavigation || !this.selectedTabId) {
            this.showToast('Warning', 'No tab selected', 'warning');
            return;
        }

        try {
            await focusTab(this.selectedTabId);
            await this.loadTabInfo();
            this.showToast('Success', 'Tab focused', 'success');
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to focus tab', 'error');
        }
    }

    async refreshSelectedTab() {
        if (!this.isConsoleNavigation || !this.selectedTabId) {
            this.showToast('Warning', 'No tab selected', 'warning');
            return;
        }

        try {
            await refreshTab(this.selectedTabId, {
                includeAllSubtabs: true
            });
            this.showToast('Success', 'Tab refreshed', 'success');
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to refresh tab', 'error');
        }
    }

    // Tab Close Disable/Enable
    async toggleTabClose() {
        if (!this.isConsoleNavigation || !this.selectedTabId) {
            this.showToast('Warning', 'No tab selected', 'warning');
            return;
        }

        try {
            this.isTabCloseDisabled = !this.isTabCloseDisabled;
            await disableTabClose(this.selectedTabId, this.isTabCloseDisabled);
            await this.loadTabInfo();
            this.showToast('Success', `Tab close ${this.isTabCloseDisabled ? 'disabled' : 'enabled'}`, 'success');
        } catch (error) {
            this.error = error;
            this.showToast('Error', 'Failed to toggle tab close', 'error');
        }
    }

    // Event Handlers
    handleTabSelect(event) {
        this.selectedTabId = event.target.value;
    }

    handleParentTabSelect(event) {
        this.selectedParentTabId = event.target.value;
    }

    handleLabelChange(event) {
        this.newTabLabel = event.target.value;
    }

    handleIconChange(event) {
        this.newTabIcon = event.target.value;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}