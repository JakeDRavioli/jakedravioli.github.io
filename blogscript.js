// --- Your Firebase Configuration ---
const __firebaseConfig = {
    apiKey: "AIzaSyDYoHigA9mww7bCDms_biNkCqrXaG3n9nc",
    authDomain: "jakedravioli-blog.firebaseapp.com",
    projectId: "jakedravioli-blog",
    storageBucket: "jakedravioli-blog.appspot.com",
    messagingSenderId: "254528428131",
    appId: "1:254528428131:web:9294cdc18e6cb93ab10056",
    measurementId: "G-9M1D7X041C"
};
const __initial_auth_token = undefined;

// --- Import Firebase services ---
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    runTransaction,
    arrayUnion,
    arrayRemove,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    writeBatch,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- GLOBAL VARIABLES ---
const appElement = document.getElementById('blog-app');
const markdownConverter = new showdown.Converter();
let db, auth, userId, likedPosts = new Set();
let unsubscribeComments = null;
let isAdmin = false;
let currentSlug = null;
let currentUser = null;
let allPostsData = []; // Cache for posts.json

// --- VINE BOOM SCRIPT INTEGRATION START ---
const audioSrc = 'https://files.catbox.moe/u1uqus.mp3';

function injectAnimationStyles() {
    if (document.getElementById('moyai-animation-styles')) return;
    const style = document.createElement('style');
    style.id = 'moyai-animation-styles';
    style.textContent = `
      @keyframes moyai-zoom-out {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(5); opacity: 0; }
      }
      .moyai-animation {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        animation: moyai-zoom-out 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
}

function makeMoyaiClickable(element) {
    if (!element) return;
    const childNodes = Array.from(element.childNodes);
    for (const node of childNodes) {
        if (node.nodeType === 1) { // Element node
            if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && !node.classList.contains('moyai-clickable')) {
                makeMoyaiClickable(node);
            }
        } else if (node.nodeType === 3 && node.textContent.includes('料')) { // Text node
            const parent = node.parentNode;
            if (!parent) continue;
            const parts = node.textContent.split('料');
            const fragment = document.createDocumentFragment();
            parts.forEach((part, index) => {
                fragment.appendChild(document.createTextNode(part));
                if (index < parts.length - 1) {
                    const moyaiSpan = document.createElement('span');
                    moyaiSpan.textContent = '料';
                    moyaiSpan.className = 'moyai-clickable';
                    moyaiSpan.style.cursor = 'pointer';
                    moyaiSpan.style.userSelect = 'none';
                    moyaiSpan.addEventListener('click', () => {
                        const audio = new Audio(audioSrc);
                        audio.play().catch(e => console.error("Vine Boom failed to play:", e));
                        const rect = moyaiSpan.getBoundingClientRect();
                        const animationSpan = document.createElement('span');
                        animationSpan.textContent = '料';
                        animationSpan.className = 'moyai-animation';
                        const computedStyle = window.getComputedStyle(moyaiSpan);
                        animationSpan.style.font = computedStyle.font;
                        animationSpan.style.lineHeight = computedStyle.lineHeight;
                        animationSpan.style.left = `${rect.left}px`;
                        animationSpan.style.top = `${rect.top}px`;
                        document.body.appendChild(animationSpan);
                        animationSpan.addEventListener('animationend', () => animationSpan.remove());
                    });
                    fragment.appendChild(moyaiSpan);
                }
            });
            parent.replaceChild(fragment, node);
        }
    }
}
// --- VINE BOOM SCRIPT INTEGRATION END ---

// --- ERROR MESSAGE TEMPLATES (NOW USING CSS CLASSES) ---
const postsListErrorHtml = `
    <div class="blog-error-box">
        <h2><span data-typewriter="Error loading blog...,The blog is down.,We encountered an error., Whoops! Error.,We did an oopsie.,Uhh... Whoops." data-rare-words=":(,Someone dropped the server by accident.,God damn it...,Okay, who unplugged the server?!,Did I get a virus or something?,Eheh... Whoooops..., Oopsy Woopsy." data-run-once="true" data-initial-delay="0"></span></h2>
        <p>We couldn't load <strong>posts.json</strong>. This is an error on my end. <a href="/index.html#contacts" class="btn-error">Contact me</a> and let me know! Send a screenshot of the console (F12).</p>
        <p>You can <a href="#">refresh the page</a> if you feel like it will help, or <a href="/index.html">return back to the home page</a>.</p>
    </div>`;

const postContentErrorHtml = (slug) => `
    <nav>
        <a href="#" class="back-link">&larr; Back to All Posts</a>
    </nav>
    <div class="blog-error-box">
        <h2>We encountered an error...</h2>
        <p>We couldn't load <strong>Post '${slug}'</strong>... This is an error on my end. <a href="/index.html#contacts" class="btn-error">Contact me</a> and let me know! Send a screenshot of the console (F12).</p>
        <p>You can <a href="#">refresh the page</a> if you feel like it will help, <a href="#">go back to the blog page</a>, or <a href="/index.html">return back to the home page</a>.</p>
    </div>`;


// --- DATA HANDLING ---
async function getPostsData() {
    if (allPostsData.length === 0) {
        try {
            const response = await fetch(`/blog/posts.json?v=${Date.now()}`);
            if (!response.ok) throw new Error('Failed to fetch posts.json');
            allPostsData = await response.json();
        } catch (error) {
            console.error(error);
            appElement.innerHTML = postsListErrorHtml;
            return null;
        }
    }
    return allPostsData;
}

// --- THEME MANAGEMENT ---
function applyTheme(theme) {
    const backgroundEl = document.querySelector('.background');
    const contentEl = document.querySelector('.content');
    if (!backgroundEl || !contentEl) return;

    if (theme === 'rt') {
        backgroundEl.classList.add('background-tint');
        contentEl.classList.add('rebTakeover');
    } else {
        backgroundEl.classList.remove('background-tint');
        contentEl.classList.remove('rebTakeover');
    }
}


// --- NSFW LOGIC ---
function revealNsfwPost(button) {
    const warningDiv = button.parentElement;
    const postContainer = warningDiv.parentElement;
    const postData = JSON.parse(decodeURIComponent(button.dataset.post));
    const slug = postData.slug;
    const hasLiked = likedPosts.has(slug);

    const postHtml = `
        <a href="#/post/${slug}" class="blog-post-link-content">
            <h2>${postData.title}</h2>
            <p class="post-date">${new Date(postData.date).toDateString()}</p>
            <p>${postData.description} | <b>Click</b> to read more!</p>
        </a>
        <div class="post-footer">
            <button class="like-button ${hasLiked ? 'liked' : ''}" data-slug="${slug}" onclick="window.handleLikeClick('${slug}', event)">
                <i class="fas fa-heart"></i>
                <span class="like-count">${postData.likeCount}</span>
            </button>
        </div>
    `;
    postContainer.innerHTML = postHtml;
}


// --- LIKING LOGIC ---
async function handleLikeClick(slug, event) {
    if (!userId) return;
    const button = event.currentTarget;
    const heartIcon = button.querySelector('.fa-heart');
    if (heartIcon) {
        heartIcon.classList.add('popping');
        heartIcon.addEventListener('animationend', () => heartIcon.classList.remove('popping'), {
            once: true
        });
    }
    const likeDocRef = doc(db, "likes", slug);
    const hasLiked = likedPosts.has(slug);
    try {
        let finalCount;
        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeDocRef);
            if (hasLiked) {
                if (likeDoc.exists()) {
                    finalCount = Math.max(0, (likeDoc.data().count || 1) - 1);
                    transaction.update(likeDocRef, {
                        count: finalCount,
                        likedBy: arrayRemove(userId)
                    });
                }
            } else {
                if (!likeDoc.exists()) {
                    finalCount = 1;
                    transaction.set(likeDocRef, {
                        count: finalCount,
                        likedBy: [userId]
                    });
                } else {
                    finalCount = (likeDoc.data().count || 0) + 1;
                    transaction.update(likeDocRef, {
                        count: finalCount,
                        likedBy: arrayUnion(userId)
                    });
                }
            }
        });
        if (finalCount !== undefined) {
            if (hasLiked) {
                likedPosts.delete(slug);
                updateLikeButton(slug, false, finalCount);
            } else {
                likedPosts.add(slug);
                updateLikeButton(slug, true, finalCount);
            }
        }
    } catch (e) {
        console.error("Like/Unlike Transaction failed: ", e);
    }
}

function updateLikeButton(slug, hasLiked, newCount) {
    const buttons = document.querySelectorAll(`.like-button[data-slug="${slug}"]`);
    buttons.forEach(button => {
        if (hasLiked) button.classList.add('liked');
        else button.classList.remove('liked');
        if (newCount !== undefined) {
            const countSpan = button.querySelector('.like-count');
            if (countSpan) countSpan.textContent = newCount;
        }
    });
}

// --- AUTH & COMMENT LOGIC ---
async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google Sign-In failed:", error);
        alert("Google Sign-In failed. Please try again.");
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        isAdmin = false;
        console.log("User signed out.");
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

async function handleCommentSubmit(slug) {
    const handleInput = document.getElementById('comment-handle');
    const contentInput = document.getElementById('comment-content');
    const submitButton = document.getElementById('comment-submit-button');

    let handle = handleInput.value.trim();
    const content = contentInput.value.trim();

    if (isAdmin) {
        handle = "JakeDRavioli";
    } else if (currentUser && !currentUser.isAnonymous) {
        handle = currentUser.displayName || currentUser.email;
    } else if (!handle) {
        handle = `Guest-${userId.substring(0, 8)}`;
    }

    if (!content) {
        alert("Please enter a comment.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Posting...';
    const batch = writeBatch(db);

    const newCommentRef = doc(collection(db, "comments", slug, "messages"));
    batch.set(newCommentRef, {
        author: handle,
        author_lowercase: handle.toLowerCase(),
        body: content,
        createdAt: serverTimestamp(),
        userId: userId,
        isAdmin: isAdmin,
        isVouched: false
    });

    if (!isAdmin) {
        const userDocRef = doc(db, "users", userId);
        batch.set(userDocRef, {
            lastCommentTimestamp: serverTimestamp()
        }, {
            merge: true
        });
    }

    try {
        await batch.commit();
        contentInput.value = '';
    } catch (error) {
        console.error("Error adding comment: ", error);
        if (error.code === 'permission-denied') {
            alert("Your comment could not be posted.");
        } else {
            alert("Sorry, there was an unknown error posting your comment.");
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Post Comment';
    }
}

async function handleDeleteComment(slug, commentId) {
    if (!confirm("Are you sure you want to delete this comment permanently? This cannot be undone.")) {
        return;
    }
    try {
        const commentRef = doc(db, "comments", slug, "messages", commentId);
        await deleteDoc(commentRef);
    } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Failed to delete comment. Check permissions and try again.");
    }
}

async function handleVouchClick(slug, commentId) {
    if (!isAdmin) return;
    const commentRef = doc(db, "comments", slug, "messages", commentId);
    try {
        const commentDoc = await getDoc(commentRef);
        if (commentDoc.exists()) {
            const currentStatus = commentDoc.data().isVouched || false;
            await updateDoc(commentRef, {
                isVouched: !currentStatus
            });
        }
    } catch (error) {
        console.error("Error vouching for comment:", error);
        alert("Could not update comment status.");
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = `<p class="comments-empty-message">There are no comments here... :(</p>`;
        return;
    }

    commentsList.innerHTML = comments.map(comment => {
        const date = comment.createdAt ? comment.createdAt.toDate().toLocaleString() : 'Just now';
        const author = comment.author.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const body = comment.body.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const isAdminComment = comment.isAdmin === true;
        const isVouched = comment.isVouched === true;

        let cardClass = 'comment-card';
        if (isAdminComment) cardClass += ' admin-comment';
        else if (isVouched) cardClass += ' vouched-card';

        const authorClass = isAdminComment ? 'comment-author admin' : 'comment-author';
        const authorName = isAdminComment ? `${author} <img src="/Images/mask.png" class="admin-icon" title="Official">` : author;

        const vouchBadgeHtml = isVouched && !isAdminComment ?
            `<img src="/Images/mask_gold.png" class="vouched-icon" title="Ravioli Approved!">` :
            '';

        const vouchButtonHtml = isAdmin ?
            `<i class="fas fa-heart comment-vouch ${isVouched ? 'vouched' : ''}" title="Ravioli Approved!" onclick="window.handleVouchClick('${currentSlug}', '${comment.id}')"></i>` :
            '';

        const deleteButtonHtml = isAdmin ?
            `<button class="delete-comment-btn" onclick="window.handleDeleteComment('${currentSlug}', '${comment.id}')">Delete</button>` :
            '';

        return `
            <div class="${cardClass}" id="comment-${comment.id}">
                <div class="comment-header">
                    <div>
                        <span class="${authorClass}">${authorName}</span>
                        ${vouchBadgeHtml}
                    </div>
                    <div class="comment-actions">
                        ${vouchButtonHtml}
                        ${deleteButtonHtml}
                        <span class="comment-date">${date}</span>
                    </div>
                </div>
                <p class="comment-body">${body}</p>
            </div>
        `;
    }).join('');
    
    makeMoyaiClickable(commentsList);
}

function initializeComments(slug) {
    currentSlug = slug;
    const commentsSection = document.getElementById('comments-section');
    if (!commentsSection) return;

    let authStatusHtml = '';
    let nameInputValue = '';
    let nameIsReadonly = '';

    if (isAdmin) {
        authStatusHtml = `Logged in as: <strong>JakeDRavioli <img src="/Images/mask.png" class="admin-icon" title="Official"> (Admin)</strong> <button onclick="window.handleLogout()">Logout</button>`;
        nameInputValue = 'value="JakeDRavioli"';
        nameIsReadonly = 'readonly';
    } else if (currentUser && !currentUser.isAnonymous) {
        authStatusHtml = `Logged in as: <strong>${currentUser.email}</strong> <button onclick="window.handleLogout()">Logout</button>`;
        const displayName = currentUser.displayName || currentUser.email;
        nameInputValue = `value="${displayName}"`;
        nameIsReadonly = 'readonly';
    } else {
        authStatusHtml = `Logged in as: <strong>Guest</strong> <button onclick="window.handleGoogleLogin()">Log in with Google</button>`;
        nameInputValue = `placeholder="Your Name (Optional)"`;
    }

    commentsSection.innerHTML = `
        <h3>Community Comments</h3>
        <h3 class="center" style="font-size:20px;">Comments have been closed until further notice. You can still view them, though!<br>If you want to talk to the community, join the discord!</h3>
            <div class="contact-grid">
        <a href="https://discord.gg/B3CyG6F8x7" target="_blank" class="contact-btn">
            <i class="fab fa-discord"></i>
            <span>Community Discord</span>
        </a>
        </div>
        <div id="comments-list">
            <p class="comments-empty-message">Loading comments...</p>
        </div>
    `;

    const commentsQuery = query(collection(db, "comments", slug, "messages"), orderBy("createdAt", "desc"));
    unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderComments(comments);
    });
}

// --- ROUTING & RENDERING ---

function calculateReadingTime(text) {
    const cleanText = text.replace(/<[^>]*>/g, " ");
    const words = cleanText.split(/\s+/).filter(Boolean).length;
    const wpm = 200;
    const minutes = Math.ceil(words / wpm);
    if (minutes < 2) return "1 minute read";
    return `${minutes} minute read`;
}

const handleRouteChange = async () => {
    let user = auth.currentUser;
    let localIsAdmin = false;

    if (!user) {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Failed to sign in anonymously on route change:", error);
        }
        return;
    }

    if (!user.isAnonymous) {
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);
        localIsAdmin = adminDoc.exists();
    }

    userId = user.uid;
    isAdmin = localIsAdmin;
    currentUser = user;

    if (unsubscribeComments) {
        unsubscribeComments();
        unsubscribeComments = null;
    }
    currentSlug = null;
    const hash = window.location.hash;

    if (hash.startsWith('#/post/')) {
        const slug = hash.substring(7);
        renderBlogPost(slug);
    } else if (hash === '#/rebellioustakeover') {
        applyTheme('rt');
        renderBlogList('rt');
    } else {
        applyTheme('main');
        renderBlogList('main');
    }
};

const renderBlogList = async (view = 'main') => {
    appElement.innerHTML = `<div class="loading-message"><h1>Loading Posts...</h1></div>`;
    const posts = await getPostsData();
    if (!posts) return;

    // --- RENDER THE STATIC PARTS OF THE PAGE FIRST ---
    let headerHtml = '';
    if (view === 'rt') {
        headerHtml = `
            <header class="blog-header">
                <div class="parallax-hero rt-blog-hero"><div id="parallax-bg" class="parallax-layer">
                <div class="scaling-bg"></div></div><div id="parallax-blog-chars" class="parallax-layer"><img src="../Images/rebTakeover/main-blog-characters.png" alt="Deren and Phenn"></div><div id="parallax-logo-content" class="parallax-layer"><img src="../Images/rebTakeoverNew.png" alt="Rebellious Takeover Logo" class="hero-logo-new rt-blog-logo"></div></div>
                <h1 class="section-header">DEVBLOG</h1>
                <p>Updates, sneak peeks, and devlogs and dev commentaries about Rebellious Takeover will be posted here.</p>
                <p><a href="#">&larr; Go back to "The JDR Blog"</a></p>
            </header>`;
    } else {
        headerHtml = `
            <header class="blog-header">
                <h1>The JDR Blog</h1>
                <p>The curious indie-devs pile of secrets. Find posts made by me, and all sorts of cool stuff like dev logs and life updates.</p>
                <p><a href="#/rebellioustakeover">Go to the Rebellious Takeover Devlog &rarr;</a></p>
            </header>`;
    }
    
    // NEW: Define the search bar HTML to be injected
    const searchHtml = `
        <div id="search-container">
            <input type="text" id="search-input" placeholder="Search posts by title or description...">
        </div>
    `;

    // NEW: Render the page structure, with the search bar now AFTER the header
    appElement.innerHTML = `${headerHtml}${searchHtml}<main></main>`;

    // --- HANDLE THE DYNAMIC POST LIST ---
    try {
        const likesSnapshot = await getDocs(collection(db, "likes"));
        const likesData = {};
        if (userId) {
            likesSnapshot.forEach(doc => {
                likesData[doc.id] = doc.data();
                if (doc.data().likedBy?.includes(userId)) {
                    likedPosts.add(doc.id);
                }
            });
        }

        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // This function now ONLY updates the list of posts inside the <main> tag
        const updateDisplayedPosts = (filterText = '') => {
            const mainElement = appElement.querySelector('main');
            if (!mainElement) return;

            const lowercasedFilter = filterText.toLowerCase();
            const visiblePosts = posts.filter(post => {
                const isInCategory = view === 'rt' 
                    ? post.forRebelliousTakeover && !post.hidden 
                    : !post.forRebelliousTakeover && !post.hidden;

                if (!isInCategory) return false;
                if (!lowercasedFilter) return true;

                const inTitle = post.title.toLowerCase().includes(lowercasedFilter);
                const inDescription = post.description.toLowerCase().includes(lowercasedFilter);
                return inTitle || inDescription;
            });
            
            const postListHtml = visiblePosts.map(post => {
                const cleanSlug = post.file.replace(/\.md$/, '');
                const likeInfo = likesData[cleanSlug] || { count: 0 };
                const hasLiked = likedPosts.has(cleanSlug);
                const readingTimeHtml = post.readingTime ? ` &bull; <i class="fa-regular fa-clock"></i> ${post.readingTime}` : '';

                if (post.nsfw) {
                    const postDataForButton = { slug: cleanSlug, title: post.title, date: post.date, description: post.description, likeCount: likeInfo.count };
                    const encodedData = encodeURIComponent(JSON.stringify(postDataForButton));
                    let customWarningHtml = post.nsfwWarningDescription ? `<p><strong>Creator's Warning:</strong> ${post.nsfwWarningDescription}</p>` : '';
                    return `
                        <div class="blog-post-link">
                            <div class="nsfw-warning">
                                <h4><i class="fa-solid fa-triangle-exclamation"></i> NSFW Warning</h4>
                                <p>The following post is intended for mature audiences (18+) only.</p>
                                <p><strong>Title:</strong> ${post.title}</p>
                                ${customWarningHtml}
                                <button data-post="${encodedData}" onclick="window.revealNsfwPost(this)">I understand, proceed</button>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="blog-post-link">
                            <a href="#/post/${cleanSlug}" class="blog-post-link-content">
                                <h2>${post.title}</h2>
                                <p class="post-date">${new Date(post.date).toDateString()}${readingTimeHtml}</p>
                                <p>${post.description} | <b>Click</b> to read more!</p>
                            </a>
                            <div class="post-footer">
                                <button class="like-button ${hasLiked ? 'liked' : ''}" data-slug="${cleanSlug}" onclick="window.handleLikeClick('${cleanSlug}', event)">
                                    <i class="fas fa-heart"></i>
                                    <span class="like-count">${likeInfo.count}</span>
                                </button>
                            </div>
                        </div>
                    `;
                }
            }).join('');

            mainElement.innerHTML = postListHtml || '<p class="loading-message">No posts found matching your search.</p>';
        };

        // Attach the event listener to the new search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => updateDisplayedPosts(searchInput.value));
        }

        // Perform the initial render of posts
        updateDisplayedPosts();

    } catch (error) {
        console.error("Error processing blog list:", error);
        appElement.innerHTML = postsListErrorHtml;
    }
};

function renderRelatedPosts(currentSlug) {
    const postData = allPostsData.find(p => p.file.replace(/\.md$/, '') === currentSlug);
    let relatedPosts = [];
    if (postData && postData.tags && postData.tags.length > 0) {
        relatedPosts = allPostsData
            .filter(p => p.file.replace(/\.md$/, '') !== currentSlug && !p.hidden)
            .map(p => {
                const otherPostSlug = p.file.replace(/\.md$/, '');
                const sharedTags = p.tags ? p.tags.filter(tag => postData.tags.includes(tag)) : [];
                return { post: p, slug: otherPostSlug, score: sharedTags.length };
            })
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }

    let heading = "You might also like...";
    if (relatedPosts.length === 0) {
        heading = "Check out these other posts...";
        const otherPosts = allPostsData.filter(p => p.file.replace(/\.md$/, '') !== currentSlug && !p.hidden);
        for (let i = otherPosts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherPosts[i], otherPosts[j]] = [otherPosts[j], otherPosts[i]];
        }
        relatedPosts = otherPosts.slice(0, 3).map(p => ({
            post: p,
            slug: p.file.replace(/\.md$/, ''),
            score: 0
        }));
    }

    if (relatedPosts.length > 0) {
        let relatedHtml = `<div class="related-posts"><h3>${heading}</h3><div class="related-posts-grid">`;
        relatedPosts.forEach(item => {
            relatedHtml += `
                <a href="#/post/${item.slug}" class="related-post-card">
                    <h4>${item.post.title}</h4>
                    <p>${item.post.description}</p>
                </a>`;
        });
        relatedHtml += `</div></div>`;
        document.getElementById('related-posts-container').innerHTML = relatedHtml;
    }
}
const renderBlogPost = async (slug) => {
    appElement.innerHTML = `<div class="loading-message"><h1>Loading Post...</h1></div>`;

    // FIX: Check if the search container exists before trying to hide it.
    // This prevents the script from crashing when loading a post page directly.
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
        searchContainer.style.display = 'none';
    }

    const posts = await getPostsData();
    if (!posts) return;

    const postData = posts.find(p => p.file.replace(/\.md$/, '') === slug);
    if (!postData) {
        appElement.innerHTML = postContentErrorHtml(slug);
        return;
    }

    if (postData.forRebelliousTakeover) applyTheme('rt');
    else applyTheme('main');

    const renderActualContent = async () => {
        try {
            const [mdResponse, likeDoc] = await Promise.all([
                fetch(`/blog/posts/${slug}.md?v=${Date.now()}`),
                getDoc(doc(db, "likes", slug))
            ]);

            if (!mdResponse.ok) throw new Error(`HTTP error! status: ${mdResponse.status}`);
            
            const markdown = await mdResponse.text();
            const readingTime = calculateReadingTime(markdown);
            const postHtml = markdownConverter.makeHtml(markdown);

            const likeInfo = likeDoc.exists() ? likeDoc.data() : { count: 0 };
            const hasLiked = likeDoc.exists() && likeDoc.data().likedBy?.includes(userId);
            if (hasLiked) likedPosts.add(slug); else likedPosts.delete(slug);

            const backLink = postData.forRebelliousTakeover ?
                `<a href="#/rebellioustakeover" class="back-link">&larr; Back to Rebellious Takeover Blog</a>` :
                `<a href="#" class="back-link">&larr; Back to All Posts</a>`;

            appElement.innerHTML = `
                <nav>${backLink}</nav>
                <article class="blog-article">
                    <div class="post-meta">
                        <h1>${postData.title}</h1>
                        <p class="post-date">${new Date(postData.date).toDateString()} &bull; <i class="fa-regular fa-clock"></i> ${readingTime}</p>
                    </div>
                    <hr>
                    ${postHtml}
                    <div class="post-footer">
                        <button class="like-button ${hasLiked ? 'liked' : ''}" data-slug="${slug}" onclick="window.handleLikeClick('${slug}', event)">
                            <i class="fas fa-heart"></i>
                            <span class="like-count">${likeInfo.count}</span>
                        </button>
                    </div>
                </article>
                <div id="related-posts-container"></div>
                <div id="comments-section"></div>
            `;

            const articleElement = appElement.querySelector('.blog-article');
            if (articleElement) {
                const images = articleElement.querySelectorAll('img');
                images.forEach(img => {
                    if (img.src.includes('#spoiler')) {
                        img.classList.add('spoiler-image');
                        img.src = img.src.split('#')[0];
                    }
                });
                articleElement.addEventListener('click', (event) => {
                    if (event.target.classList.contains('spoiler')) {
                        event.target.classList.toggle('revealed');
                    }
                });
                makeMoyaiClickable(articleElement);
            }
            renderRelatedPosts(slug);
            initializeComments(slug);
        } catch (error) {
            console.error(`Error fetching post ${slug}.md:`, error);
            appElement.innerHTML = postContentErrorHtml(slug);
        }
    };

    if (postData.nsfw) {
        let customWarningHtml = postData.nsfwWarningDescription ? `<p><strong>Creator's Warning:</strong> ${postData.nsfwWarningDescription}</p>` : '';
        const backLink = postData.forRebelliousTakeover ? `<a href="#/rebellioustakeover" class="back-link">&larr; Back to Rebellious Takeover Blog</a>` : `<a href="#" class="back-link">&larr; Back to All Posts</a>`;

        appElement.innerHTML = `
            <nav>${backLink}</nav>
            <article class="blog-article">
                <div class="nsfw-warning">
                    <h4><i class="fa-solid fa-triangle-exclamation"></i> NSFW Warning</h4>
                    <p>This post is intended for mature audiences (18+). Viewer discretion is advised.</p>
                    <p><strong>Title:</strong> ${postData.title}</p>
                    ${customWarningHtml}
                    <button id="nsfw-proceed-button" disabled>I understand, proceed (10)</button><br><br>
                    <a href="blog.html" class="btn btn-secondary">Go back to safety</a>
                </div>
            </article>`;

        const proceedButton = document.getElementById('nsfw-proceed-button');
        let countdown = 10;
        const timer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                proceedButton.textContent = `I understand, proceed (${countdown})`;
            } else {
                clearInterval(timer);
                proceedButton.disabled = false;
                proceedButton.textContent = 'I understand, proceed';
                proceedButton.addEventListener('click', renderActualContent);
            }
        }, 1000);
    } else {
        await renderActualContent();
    }
};

function initializeBackToTopButton() {
    const btn = document.getElementById("backToTopBtn");
    if (!btn) return;

    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    };

    btn.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- INITIALIZATION ---
async function initialize() {
    try {
        const app = initializeApp(__firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        injectAnimationStyles();
        console.log(' Vine Boom styles injected.');
        initializeBackToTopButton();

        onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed, running router...");
            handleRouteChange();
        });

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        let errorMessage = `<div class="blog-error-box"><h2>Database Connection Failed</h2>`;
        if (error.code === 'auth/configuration-not-found') {
            errorMessage += `<p><strong>Action Required:</strong> The liking feature can't start because Anonymous Authentication isn't enabled in your Firebase project.</p><p><strong>How to fix:</strong></p><ol><li>Go to the <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a>.</li><li>Navigate to <strong>Build > Authentication > Sign-in method</strong>.</li><li>Click on <strong>"Anonymous"</strong> in the list of providers.</li><li>Enable the toggle switch and click <strong>Save</strong>.</li></ol><p>After enabling it, refresh this page.</p>`;
        } else {
            errorMessage += `<p>Could not connect to the social database. Please check the console (F12) for more details.</p>`;
        }
        errorMessage += `</div>`;
        appElement.innerHTML = errorMessage;
    }
}

// --- Expose handlers to the global scope ---
window.handleLikeClick = handleLikeClick;
window.handleCommentSubmit = handleCommentSubmit;
window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;
window.handleDeleteComment = handleDeleteComment;
window.handleVouchClick = handleVouchClick;
window.revealNsfwPost = revealNsfwPost;

// --- START THE APP ---
initialize();
window.addEventListener('hashchange', handleRouteChange);