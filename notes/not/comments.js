import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    collection,
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    setDoc,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeV5vyczMxxhhyKXXltJGPbDU_JFJujkU",
  authDomain: "tamny-security-test.firebaseapp.com",
  projectId: "tamny-security-test",
  storageBucket: "tamny-security-test.firebasestorage.app",
  messagingSenderId: "1013673633549",
  appId: "1:1013673633549:web:2ef6e0da24db55cb04f244",
  measurementId: "G-CQ81DWNMHC"
};





// ==================================================
// Initialize Firebase
// ==================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


// ==================================================
// Firestore
// ==================================================



const db =
    getFirestore(app);


// ==================================================
// Local Storage Keys
// ==================================================

const USER_KEY =
    "tamny_user";

const INITIAL_KEY =
    "tamny_initial";


// ==================================================
// Elements
// ==================================================

const commentInput =
    document.getElementById(
        "commentInput"
    );

const addCommentBtn =
    document.getElementById(
        "addCommentBtn"
    );

const commentsList =
    document.getElementById(
        "commentsList"
    );


// ==================================================
// HTML Protection
// ==================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// ==================================================
// Format Date
// ==================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "الآن";
    }

    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleString(
            "ar-EG"
        );

    } catch {

        return "الآن";
    }
}


// ==================================================
// 🔐 Wait for Authentication
// ==================================================

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            commentsList.innerHTML = `
                <div class="comments-loading">
                    🔐 يجب تسجيل الدخول أولًا.
                </div>
            `;

            addCommentBtn.disabled =
                true;

            return;
        }


        addCommentBtn.disabled =
            false;


        // تشغيل التعليقات

        watchComments();
    }
);


// ==================================================
// 👀 Watch Comments
// ==================================================

function watchComments() {

console.log("🟢 watchComments اشتغلت");

    const commentsRef =
        collection(
            db,
            "comments"
        );


    const commentsQuery =
        query(
            commentsRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(

        commentsQuery,

        snapshot => {

            console.log("🟢 Snapshot وصل");
console.log("📊 عدد التعليقات:", snapshot.size);

            commentsList.innerHTML =
                "";


            if (snapshot.empty) {

                commentsList.innerHTML = `
                    <div class="comments-loading">
                        💬 لا توجد معلومات حتى الآن.
                    </div>
                `;

                return;
            }


            snapshot.forEach(
                commentDoc => {

                    const comment =
                        commentDoc.data();


                    renderComment(
                        commentDoc.id,
                        comment
                    );
                }
            );
        },


        error => {

            console.error(
                "Comments Listener Error:",
                error
            );


            commentsList.innerHTML = `
                <div class="comments-loading">
                    ❌ تعذر تحميل المعلومات.
                </div>
            `;
        }
    );
}




// ==================================================
// 🧱 Render Comment
// ==================================================
function renderComment(
    commentId,
    comment
) {

    if (!commentsList) {
        return;
    }


    // =========================================
    // إنشاء div مستقل لهذا التعليق
    // =========================================

    const div =
        document.createElement("div");

    div.className =
        "community-comment";


    // =========================================
    // بيانات التعليق
    // =========================================

    const initial =
        comment.initial || "•";


    const userId =
        comment.userId || "------";


    const text =
        comment.text || "";


    const currentUser =
        auth.currentUser;


    // =========================================
    // هل التعليق يخص المستخدم الحالي؟
    // =========================================

    const isCurrentUser =
        currentUser &&
        comment.uid ===
        currentUser.uid;


    // =========================================
    // زر الحذف
    // =========================================

    let deleteButtonHTML =
        "";


    if (isCurrentUser) {

        deleteButtonHTML = `

            <button
                type="button"
                class="delete-comment-btn"
                title="حذف التعليق"
            >
                🗑️
            </button>

        `;
    }


    // =========================================
    // محتوى التعليق
    // =========================================

    div.innerHTML = `

        <div class="comment-header">

            <div class="comment-identity">

                <span class="comment-avatar">

                    ${escapeHTML(
                        initial
                    )}

                </span>


                <div>

                    <strong>

                        👤 ${escapeHTML(
                            userId
                        )}

                    </strong>


                    ${
                        isCurrentUser
                            ? `
                                <small>
                                    أنت
                                </small>
                              `
                            : ""
                    }

                </div>

            </div>


            ${deleteButtonHTML}

        </div>


        <div class="comment-text">

            ${escapeHTML(
                text
            )}

        </div>


        <div class="comment-time">

            ${escapeHTML(
                formatDate(
                    comment.createdAt
                )
            )}

        </div>

    `;


    // =========================================
    // زر حذف التعليق
    // =========================================

    const deleteButton =
        div.querySelector(
            ".delete-comment-btn"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            async () => {

                const confirmed =
                    confirm(
                        "⚠️ هل تريد حذف تعليقك؟"
                    );


                if (!confirmed) {
                    return;
                }


                deleteButton.disabled =
                    true;


                deleteButton.textContent =
                    "⏳";


                try {

                    await deleteDoc(
                        doc(
                            db,
                            "comments",
                            commentId
                        )
                    );


                    console.log(
                        "✅ تم حذف التعليق"
                    );


                } catch (error) {

                    console.error(
                        "Delete Comment Error:",
                        error
                    );


                    alert(
                        "❌ تعذر حذف التعليق.\n\n" +
                        error.message
                    );


                    deleteButton.disabled =
                        false;


                    deleteButton.textContent =
                        "🗑️";
                }

            }
        );
    }


    // =========================================
    // إضافة div الخاص بهذا التعليق
    // =========================================

    commentsList.appendChild(
        div
    );
}









// ==================================================
// 📤 Add Comment
// ==================================================

addCommentBtn.onclick =
    async function () {

        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "❌ يجب تسجيل الدخول أولًا."
            );

            return;
        }


        const text =
            commentInput.value.trim();


        if (!text) {

            alert(
                "اكتب المعلومة أولًا."
            );

            commentInput.focus();

            return;
        }


        if (text.length > 500) {

            alert(
                "المعلومة طويلة جدًا."
            );

            return;
        }


        const userId =
            localStorage.getItem(
                USER_KEY
            ) || "";


        const initial =
            localStorage.getItem(
                INITIAL_KEY
            ) || "";


        if (!userId) {

            alert(
                "❌ لم يتم العثور على رقم المستخدم."
            );

            return;
        }


        // منع الضغط المتكرر

        addCommentBtn.disabled =
            true;


        addCommentBtn.textContent =
            "⏳ جاري النشر...";


        try {

            await addDoc(

                collection(
                    db,
                    "comments"
                ),

                {

                    uid:
                        user.uid,

                    userId:
                        userId,

                    initial:
                        initial,

                    text:
                        text,

                    createdAt:
                        serverTimestamp()
                }
            );


            commentInput.value =
                "";


        } catch (error) {

            console.error(
                "Add Comment Error:",
                error
            );


            alert(
                "❌ تعذر نشر المعلومة."
            );

        } finally {

            addCommentBtn.disabled =
                false;

            addCommentBtn.textContent =
                "📤 نشر المعلومة";
        }
    };
    const commentsBackBtn =
    document.getElementById("commentsBackBtn");

if (commentsBackBtn) {
    commentsBackBtn.addEventListener("click", () => {
        history.back();
    });
}