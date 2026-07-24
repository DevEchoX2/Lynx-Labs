const defaultBookmarksData = [
{ id: '1001', title: 'Google', url: 'https://www.google.com', icon: 'G' },
{ id: '1002', title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'D' },
{ id: '1003', title: 'GitHub', url: 'https://github.com', icon: 'H' },
{ id: '1004', title: 'YouTube', url: 'https://youtube.com', icon: 'Y' },
{ id: '1005', title: 'Reddit', url: 'https://reddit.com', icon: 'R' }
];
class BookmarksSystem {
constructor(containerId) {
this.containerId = containerId;
this.container = document.getElementById(containerId);
this.bookmarks = [];
this.init();
}
init() {
if (!this.container) {
return;
}
this.loadFromStorage();
this.renderAll();
this.setupGlobalListeners();
}
loadFromStorage() {
const rawData = localStorage.getItem('waves_global_bookmarks');
if (rawData) {
try {
this.bookmarks = JSON.parse(rawData);
} catch (error) {
this.bookmarks = this.getFallbackData();
}
} else {
this.bookmarks = this.getFallbackData();
this.saveToStorage();
}
}
getFallbackData() {
const fallback = [];
for (let i = 0; i < defaultBookmarksData.length; i++) {
fallback.push({
id: defaultBookmarksData[i].id,
title: defaultBookmarksData[i].title,
url: defaultBookmarksData[i].url,
icon: defaultBookmarksData[i].icon
});
}
return fallback;
}
saveToStorage() {
const dataString = JSON.stringify(this.bookmarks);
localStorage.setItem('waves_global_bookmarks', dataString);
}
createNodeElement(bookmarkObj) {
const wrapper = document.createElement('a');
wrapper.className = 'bookmark-node';
wrapper.href = bookmarkObj.url;
wrapper.target = 'browser-viewport';
wrapper.setAttribute('data-id', bookmarkObj.id);
const textSpan = document.createElement('span');
textSpan.textContent = bookmarkObj.title;
wrapper.appendChild(textSpan);
wrapper.addEventListener('click', (e) => {
e.preventDefault();
this.handleBookmarkClick(bookmarkObj);
});
wrapper.addEventListener('contextmenu', (e) => {
e.preventDefault();
this.handleContextMenu(e, bookmarkObj.id);
});
return wrapper;
}
renderAll() {
if (!this.container) {
return;
}
this.container.innerHTML = '';
for (let i = 0; i < this.bookmarks.length; i++) {
const node = this.createNodeElement(this.bookmarks[i]);
this.container.appendChild(node);
}
}
addBookmark(title, url, icon = '') {
if (!title || !url) {
return false;
}
const newId = 'bm_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
const finalUrl = this.formatUrl(url);
const finalIcon = icon || title.charAt(0).toUpperCase();
const newBookmark = {
id: newId,
title: title,
url: finalUrl,
icon: finalIcon
};
this.bookmarks.push(newBookmark);
this.saveToStorage();
this.renderAll();
return true;
}
removeBookmarkById(id) {
const initialLength = this.bookmarks.length;
const filtered = [];
for (let i = 0; i < this.bookmarks.length; i++) {
if (this.bookmarks[i].id !== id) {
filtered.push(this.bookmarks[i]);
}
}
this.bookmarks = filtered;
if (this.bookmarks.length !== initialLength) {
this.saveToStorage();
this.renderAll();
return true;
}
return false;
}
formatUrl(rawUrl) {
let cleaned = rawUrl.trim();
if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://') && !cleaned.startsWith('waves://')) {
cleaned = 'https://' + cleaned;
}
return cleaned;
}
handleBookmarkClick(bookmarkObj) {
const iframe = document.getElementById('browser-viewport');
const urlInput = document.getElementById('url-input');
if (iframe) {
iframe.src = bookmarkObj.url;
}
if (urlInput) {
urlInput.value = bookmarkObj.url;
}
}
handleContextMenu(event, id) {
const confirmDelete = window.confirm('Remove this bookmark?');
if (confirmDelete) {
this.removeBookmarkById(id);
}
}
setupGlobalListeners() {
const starBtn = document.getElementById('bookmark-star-btn');
if (starBtn) {
starBtn.addEventListener('click', () => {
const urlInput = document.getElementById('url-input');
const iframe = document.getElementById('browser-viewport');
if (urlInput && urlInput.value) {
const currentUrl = urlInput.value;
const currentTitle = iframe ? iframe.contentWindow.document.title || currentUrl : currentUrl;
this.addBookmark(currentTitle, currentUrl);
}
});
}
}
getAllBookmarks() {
return this.bookmarks;
}
}
window.addEventListener('DOMContentLoaded', () => {
window.wavesBookmarks = new BookmarksSystem('global-bookmarks-list');
});
