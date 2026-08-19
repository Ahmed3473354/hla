import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// Firebase
// ==========================================

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


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);

const auth =
    getAuth(app);


// ==========================================
// Elements
// ==========================================

const chatMessages =
    document.getElementById(
        "chatMessages"
    );

const chatInput =
    document.getElementById(
        "chatInput"
    );

const sendMessageBtn =
    document.getElementById(
        "sendMessageBtn"
    );


// ==========================================
// Local Storage
// ==========================================

const USER_KEY =
    "tamny_user";

const FAMILY_KEY =
    "tamny_family";

const INITIAL_KEY =
    "tamny_initial";


// ==========================================
// Variables
// ==========================================

let currentUser = null;

let family = null;

let unsubscribeMessages = null;


// ==========================================
// Start
// ==========================================

async function startChat() {

    try {

        const savedUser =
            localStorage.getItem(
                USER_KEY
            );

        const savedFamily =
            localStorage.getItem(
                FAMILY_KEY
            );


        if (!savedUser) {

            showError(
                "لم يتم إنشاء رقم مستخدم بعد."
            );

            return;
        }


        if (!savedFamily) {

            showError(
                "يجب الانضمام إلى عائلة أولًا."
            );

            return;
        }


        family =
            JSON.parse(
                savedFamily
            );


        if (
            !family ||
            !family.id
        ) {

            showError(
                "بيانات العائلة غير صحيحة."
            );

            return;
        }


        await signInAnonymously(auth);


        currentUser =
            auth.currentUser;


        if (!currentUser) {

            showError(
                "تعذر تسجيل الدخول."
            );

            return;
        }


        console.log(
            "Chat Firebase جاهز ✅"
        );


        listenToMessages();


    } catch (error) {

        console.error(
            "Chat Start Error:",
            error
        );


        showError(
            "حدث خطأ أثناء تشغيل المحادثة."
        );

    }

}


// ==========================================
// Listen To Messages
// ==========================================

function listenToMessages() {

    if (unsubscribeMessages) {

        unsubscribeMessages();

    }


    const messagesRef =
        collection(
            db,
            "families",
            family.id,
            "messages"
        );


    const messagesQuery =
        query(
            messagesRef,
            orderBy(
                "createdAt",
                "asc"
            )
        );


    unsubscribeMessages =
        onSnapshot(

            messagesQuery,

            snapshot => {

                chatMessages.innerHTML = "";


                snapshot.forEach(
                    messageDoc => {

                        const message =
                            messageDoc.data();


                        renderMessage(
                            message
                        );

                    }
                );


                scrollToBottom();

            },


            error => {

                console.error(
                    "Messages Error:",
                    error
                );


                showError(
                    "تعذر تحميل الرسائل."
                );

            }

        );

}


// ==========================================
// Render Message
// ==========================================

function renderMessage(message) {

    const div =
        document.createElement(
            "div"
        );


    const myMessage =
        currentUser &&
        message.uid ===
        currentUser.uid;


    div.className =
        myMessage
            ? "chat-message mine"
            : "chat-message";


    const initial =
        message.initial ||
        "•";


    let time =
        "";


    if (message.createdAt) {

        try {

            time =
                message.createdAt
                    .toDate()
                    .toLocaleTimeString(
                        "ar-EG",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );

        } catch {

            time = "";

        }

    }


    div.innerHTML = `

        <div class="chat-message-name">

            👤 ${escapeHTML(initial)}
            •
            ${escapeHTML(
                message.userId || ""
            )}

        </div>

        <div class="chat-message-text">

            ${escapeHTML(
                message.text || ""
            )}

        </div>

        <div class="chat-message-time">

            ${time}

        </div>

    `;


    chatMessages.appendChild(
        div
    );

}


// ==========================================
// Send Message
// ==========================================

async function sendMessage() {

    const text =
        chatInput.value.trim();


    if (!text) {

        return;

    }


    if (!currentUser) {

        alert(
            "المحادثة لم تجهز بعد."
        );

        return;

    }


    if (
        !family ||
        !family.id
    ) {

        alert(
            "أنت لست داخل عائلة."
        );

        return;

    }


    const userId =
        localStorage.getItem(
            USER_KEY
        ) || "مستخدم";


    const initial =
        localStorage.getItem(
            INITIAL_KEY
        ) || "•";


    sendMessageBtn.disabled =
        true;


    try {

        const messagesRef =
            collection(
                db,
                "families",
                family.id,
                "messages"
            );


        await addDoc(

            messagesRef,

            {

                uid:
                    currentUser.uid,

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


        chatInput.value = "";


        chatInput.focus();


    } catch (error) {

        console.error(
            "Send Message Error:",
            error
        );


        alert(
            "تعذر إرسال الرسالة."
        );


    } finally {

        sendMessageBtn.disabled =
            false;

    }

}


// ==========================================
// Button
// ==========================================

sendMessageBtn.onclick =
    sendMessage;


// ==========================================
// Enter To Send
// ==========================================

chatInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ==========================================
// Scroll
// ==========================================

function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ==========================================
// Error
// ==========================================

function showError(message) {

    chatMessages.innerHTML = `

        <div
            style="
                text-align:center;
                padding:30px;
                color:#777;
            "
        >

            ⚠️ ${escapeHTML(message)}

        </div>

    `;

}


// ==========================================
// Security: Escape HTML
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(value);

    return div.innerHTML;

}


// ==================================================
// 🗑️ Leave Family - حذف نفسي من العائلة
// ==================================================

async function leaveFamily() {

    const saved =
        localStorage.getItem(FAMILY_KEY);

    if (!saved) {

        alert("❌ أنت لست داخل عائلة.");
        return;
    }

    let family;

    try {

        family = JSON.parse(saved);

    } catch {

        alert("❌ بيانات العائلة غير صحيحة.");
        return;
    }

    if (!family || !family.id) {

        alert("❌ لم يتم العثور على العائلة.");
        return;
    }

    const currentUser =
        auth.currentUser;

    if (!currentUser) {

        alert("❌ Firebase لم يجهز بعد.");
        return;
    }

    const confirmed =
        confirm(
            "⚠️ هل تريد حذف نفسك من العائلة؟\n\n" +
            "سيتم إلغاء عضويتك في هذه العائلة."
        );

    if (!confirmed) {
        return;
    }

    try {

        // =========================================
        // حذف عضوية المستخدم الحالي فقط
        // =========================================

        await deleteDoc(

            doc(
                db,
                "families",
                family.id,
                "members",
                currentUser.uid
            )

        );


        // =========================================
        // حذف العائلة المحفوظة محليًا
        // =========================================

        localStorage.removeItem(
            FAMILY_KEY
        );


        // =========================================
        // حذف حالة الأمان
        // =========================================

        localStorage.removeItem(
            SAFE_KEY
        );


        alert(
            "✅ تم حذف عضويتك من العائلة."
        );


        // =========================================
        // إعادة تحميل الصفحة
        // =========================================

        location.reload();


    } catch (error) {

        console.error(
            "Leave Family Error:",
            error
        );

        alert(
            "❌ تعذر حذف عضويتك.\n\n" +
            error.message
        );
    }
}


// ==========================================
// Start Chat
// ==========================================

startChat();