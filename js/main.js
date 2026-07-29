class LynxBrowserController {
constructor() {
this.iframe = document.getElementById('browser-viewport');
this.urlInput = document.getElementById('url-input');
this.tabsBar = document.getElementById('tabs-bar');
this.addTabBtn = document.getElementById('add-tab-btn');
this.navBack = document.getElementById('nav-back');
this.navForward = document.getElementById('nav-forward');
this.navRefresh = document.getElementById('nav-refresh');
this.history = [];
this.historyIndex = -1;
this.tabs = [];
this.activeTabId = null;
this.init();
}
init() {
this.bindNavigationControls();
this.bindUrlBarControls();
this.bindTabControls();
this.setupInitialTab();
this.monitorIframeChanges();
}
setupInitialTab() {
const initialTabElement = document.querySelector('.tab.active');
if (initialTabElement) {
const initialId = 'tab_' + Date.now();
initialTabElement.setAttribute('data-tab-id', initialId);
this.tabs.push({
id: initialId,
element: initialTabElement,
url: 'lynx://newtab',
title: 'New Tab'
});
this.activeTabId = initialId;
this.bindSingleTabEvents(initialTabElement, initialId);
} else {
this.createNewTab('lynx://newtab', 'New Tab');
}
}
bindNavigationControls() {
if (this.navBack) {
this.navBack.addEventListener('click', () => {
if (this.iframe && this.iframe.contentWindow) {
try {
this.iframe.contentWindow.history.back();
} catch (e) {}
}
});
}
if (this.navForward) {
this.navForward.addEventListener('click', () => {
if (this.iframe && this.iframe.contentWindow) {
try {
this.iframe.contentWindow.history.forward();
} catch (e) {}
}
});
}
if (this.navRefresh) {
this.navRefresh.addEventListener('click', () => {
if (this.iframe) {
if (window.frame && !this.urlInput.value.startsWith('lynx://')) {
window.frame.reload();
} else {
this.iframe.src = this.iframe.src;
}
}
});
}
}
bindUrlBarControls() {
if (this.urlInput) {
this.urlInput.addEventListener('keydown', (e) => {
if (e.key === 'Enter') {
e.preventDefault();
this.navigateCurrentTab(this.urlInput.value);
}
});
this.urlInput.addEventListener('focus', () => {
this.urlInput.select();
});
}
}
bindTabControls() {
if (this.addTabBtn) {
this.addTabBtn.addEventListener('click', () => {
this.createNewTab('lynx://newtab', 'New Tab');
});
}
}
bindSingleTabEvents(tabElement, tabId) {
tabElement.addEventListener('click', (e) => {
if (e.target.closest('.tab-close')) {
e.stopPropagation();
this.closeTab(tabId);
} else {
this.switchTab(tabId);
}
});
}
createNewTab(url, title) {
const tabId = 'tab_' + Date.now();
const tabDiv = document.createElement('div');
tabDiv.className = 'tab';
tabDiv.setAttribute('data-tab-id', tabId);
const iconDiv = document.createElement('div');
iconDiv.className = 'tab-icon';
iconDiv.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle></svg>';
const titleDiv = document.createElement('div');
titleDiv.className = 'tab-title';
titleDiv.textContent = title;
const closeDiv = document.createElement('div');
closeDiv.className = 'tab-close';
closeDiv.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
tabDiv.appendChild(iconDiv);
tabDiv.appendChild(titleDiv);
tabDiv.appendChild(closeDiv);
if (this.addTabBtn) {
this.tabsBar.insertBefore(tabDiv, this.addTabBtn);
} else {
this.tabsBar.appendChild(tabDiv);
}
this.tabs.push({
id: tabId,
element: tabDiv,
url: url,
title: title
});
this.bindSingleTabEvents(tabDiv, tabId);
this.switchTab(tabId);
}
switchTab(tabId) {
const targetTab = this.tabs.find(t => t.id === tabId);
if (!targetTab) {
return;
}
this.tabs.forEach(t => {
t.element.classList.remove('active');
});
targetTab.element.classList.add('active');
this.activeTabId = tabId;
if (this.urlInput) {
this.urlInput.value = targetTab.url;
}
if (targetTab.url.startsWith('lynx://')) {
const route = targetTab.url.replace('lynx://', '');
this.iframe.src = route === 'newtab' ? 'newtab.html' : `pages/${route}.html`;
if (window.frame) window.frame = null;
} else {
if (window.scramjet) {
if (!window.frame) {
this.iframe.src = 'about:blank';
window.frame = window.scramjet.createFrame(this.iframe);
}
setTimeout(() => window.frame.go(targetTab.url), 50);
} else {
this.iframe.src = targetTab.url;
}
}
}
closeTab(tabId) {
const tabIndex = this.tabs.findIndex(t => t.id === tabId);
if (tabIndex === -1) {
return;
}
const tabToRemove = this.tabs[tabIndex];
tabToRemove.element.remove();
this.tabs.splice(tabIndex, 1);
if (this.tabs.length === 0) {
this.createNewTab('lynx://newtab', 'New Tab');
} else if (this.activeTabId === tabId) {
const newActiveIndex = Math.max(0, tabIndex - 1);
this.switchTab(this.tabs[newActiveIndex].id);
}
}
navigateCurrentTab(rawUrl) {
if (!rawUrl) {
return;
}
let finalUrl = rawUrl.trim();
if (finalUrl.startsWith('lynx://')) {
const route = finalUrl.replace('lynx://', '');
this.iframe.src = route === 'newtab' ? 'newtab.html' : `pages/${route}.html`;
if (window.frame) window.frame = null;
this.updateActiveTabData(finalUrl, route === 'newtab' ? 'New Tab' : route);
return;
}
if (!finalUrl.includes('.') && !finalUrl.startsWith('file://') && !finalUrl.includes('localhost')) {
finalUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(finalUrl);
} else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
finalUrl = 'https://' + finalUrl;
}
if (window.scramjet) {
if (!window.frame) {
this.iframe.src = 'about:blank';
window.frame = window.scramjet.createFrame(this.iframe);
}
setTimeout(() => window.frame.go(finalUrl), 50);
} else if (this.iframe) {
this.iframe.src = finalUrl;
}
this.updateActiveTabData(finalUrl, finalUrl);
}
updateActiveTabData(url, title) {
const activeTab = this.tabs.find(t => t.id === this.activeTabId);
if (activeTab) {
activeTab.url = url;
activeTab.title = title;
const titleEl = activeTab.element.querySelector('.tab-title');
if (titleEl) {
titleEl.textContent = title;
}
if (this.urlInput && document.activeElement !== this.urlInput) {
this.urlInput.value = url;
}
}
}
monitorIframeChanges() {
if (!this.iframe) {
return;
}
this.iframe.addEventListener('load', () => {
try {
const currentUrl = this.iframe.contentWindow.location.href;
if (!currentUrl || currentUrl === 'about:blank') return;
let newUrl = currentUrl;
let newTitle = this.iframe.contentDocument.title || currentUrl;
if (currentUrl.includes('newtab.html')) {
newUrl = 'lynx://newtab';
newTitle = 'New Tab';
} else if (currentUrl.includes('pages/')) {
const page = currentUrl.split('/').pop().replace('.html', '');
newUrl = `lynx://${page}`;
newTitle = page;
}
this.updateActiveTabData(newUrl, newTitle);
} catch (e) {}
});
}
}
window.addEventListener('DOMContentLoaded', () => {
if (document.querySelector('.browser-ui')) {
window.lynxBrowserController = new LynxBrowserController();
}
});
